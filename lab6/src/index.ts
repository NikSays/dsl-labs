import ReadLine from 'readline'
import util from 'util'

const DIGITS = '0123456789'

class ASTError {
  posStart: Position
  posEnd: Position
  errorName: string
  details: string

  constructor (posStart: Position, posEnd: Position, errorName: string, details: string) {
    this.posStart = posStart
    this.posEnd = posEnd
    this.errorName = errorName
    this.details = details
  }

  toString (): string {
    let result = `${this.errorName}: ${this.details}\n`
    result += `File ${this.posStart.fn}, line ${this.posStart.ln + 1}\n\n`
    result += stringWithArrows(this.posStart.ftxt, this.posStart, this.posEnd)
    return result
  }
}

class IllegalCharError extends ASTError {
  constructor (posStart: Position, posEnd: Position, details: string) {
    super(posStart, posEnd, 'Illegal Character', details)
  }
}

class InvalidSyntaxError extends ASTError {
  constructor (posStart: Position, posEnd: Position, details: string = '') {
    super(posStart, posEnd, 'Invalid Syntax', details)
  }
}

class Position {
  idx: number
  ln: number
  col: number
  fn: string
  ftxt: string

  constructor (idx: number, ln: number, col: number, fn: string, ftxt: string) {
    this.idx = idx
    this.ln = ln
    this.col = col
    this.fn = fn
    this.ftxt = ftxt
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  [util.inspect.custom] () {
    return ''
  }

  advance (currentChar: string | null = null): this {
    this.idx += 1
    this.col += 1

    if (currentChar === '\n') {
      this.ln += 1
      this.col = 0
    }

    return this
  }

  copy (): Position {
    return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt)
  }
}

const TT_INT = 'INT'
const TT_FLOAT = 'FLOAT'
const TT_PLUS = 'PLUS'
const TT_MINUS = 'MINUS'
const TT_MUL = 'MUL'
const TT_DIV = 'DIV'
const TT_LPAREN = 'LPAREN'
const TT_RPAREN = 'RPAREN'
const TT_EOF = 'EOF'

class Token {
  type: string
  value: any
  posStart: Position | null
  posEnd: Position | null

  constructor (type: string, value: any = null, posStart: Position | null = null, posEnd: Position | null = null) {
    this.type = type
    this.value = value
    this.posStart = (posStart != null) ? posStart.copy() : null
    this.posEnd = (posStart != null) ? posStart.copy() : null

    if (posEnd != null) {
      this.posEnd = posEnd
    } else if (this.posEnd != null) {
      this.posEnd.advance()
    }
  }

  toString (): string {
    return this.value !== null ? `${this.type}: ${this.value}` : `${this.type}`
  }
}

class Lexer {
  fn: string
  text: string
  pos: Position
  currentChar: string | null

  constructor (fn: string, text: string) {
    this.fn = fn
    this.text = text
    this.pos = new Position(-1, 0, -1, fn, text)
    this.currentChar = null
    this.advance()
  }

  advance (): void {
    this.pos.advance(this.currentChar)
    this.currentChar = this.pos.idx < this.text.length ? this.text[this.pos.idx] : null
  }

  make_tokens (): [Token[], ASTError | null] {
    const tokens: Token[] = []

    while (this.currentChar !== null) {
      if (' \t'.includes(this.currentChar)) {
        this.advance()
      } else if (DIGITS.includes(this.currentChar)) {
        tokens.push(this.make_number())
      } else if (this.currentChar === '+') {
        tokens.push(new Token(TT_PLUS, null, this.pos))
        this.advance()
      } else if (this.currentChar === '-') {
        tokens.push(new Token(TT_MINUS, null, this.pos))
        this.advance()
      } else if (this.currentChar === '*') {
        tokens.push(new Token(TT_MUL, null, this.pos))
        this.advance()
      } else if (this.currentChar === '/') {
        tokens.push(new Token(TT_DIV, null, this.pos))
        this.advance()
      } else if (this.currentChar === '(') {
        tokens.push(new Token(TT_LPAREN, null, this.pos))
        this.advance()
      } else if (this.currentChar === ')') {
        tokens.push(new Token(TT_RPAREN, null, this.pos))
        this.advance()
      } else {
        const posStart = this.pos.copy()
        const char = this.currentChar
        this.advance()
        return [[], new IllegalCharError(posStart, this.pos, '\'' + char + '\'')]
      }
    }

    tokens.push(new Token(TT_EOF, null, this.pos))
    return [tokens, null]
  }

  make_number (): Token {
    let numStr = ''
    let dotCount = 0
    const posStart = this.pos.copy()

    while (this.currentChar !== null && (DIGITS + '.').includes(this.currentChar)) {
      if (this.currentChar === '.') {
        if (dotCount === 1) break
        dotCount += 1
        numStr += '.'
      } else {
        numStr += this.currentChar
      }
      this.advance()
    }

    if (dotCount === 0) {
      return new Token(TT_INT, parseInt(numStr), posStart, this.pos)
    } else {
      return new Token(TT_FLOAT, parseFloat(numStr), posStart, this.pos)
    }
  }
}

class NumberNode {
  tok: Token

  constructor (tok: Token) {
    this.tok = tok
  }

  toString (): string {
    return `${this.tok.value}`
  }
}

class BinOpNode {
  leftNode: any
  opTok: Token
  rightNode: any

  constructor (leftNode: any, opTok: Token, rightNode: any) {
    this.leftNode = leftNode
    this.opTok = opTok
    this.rightNode = rightNode
  }

  toString (): string {
    return `(${this.leftNode}, ${this.opTok.value}, ${this.rightNode})`
  }
}

class UnaryOpNode {
  opTok: Token
  node: any

  constructor (opTok: Token, node: any) {
    this.opTok = opTok
    this.node = node
  }

  toString (): string {
    return `(${this.opTok.value}, ${this.node})`
  }
}

class ParseResult {
  error: ASTError | null
  node: any

  constructor () {
    this.error = null
    this.node = null
  }

  register (res: any): any {
    if (res instanceof ParseResult) {
      if (res.error != null) this.error = res.error
      return res.node
    }
    return res
  }

  success (node: any): this {
    this.node = node
    return this
  }

  failure (error: ASTError): this {
    this.error = error
    return this
  }
}

class Parser {
  tokens: Token[]
  tok_idx: number
  current_tok: Token | null

  constructor (tokens: Token[]) {
    this.tokens = tokens
    this.tok_idx = -1
    this.current_tok = null
    this.advance()
  }

  advance (): Token | null {
    this.tok_idx += 1
    if (this.tok_idx < this.tokens.length) {
      this.current_tok = this.tokens[this.tok_idx]
    }
    return this.current_tok
  }

  parse (): ParseResult {
    const res = this.expr()
    if ((res.error == null) && this.current_tok != null && this.current_tok?.type !== TT_EOF) {
      return res.failure(
        new InvalidSyntaxError(
          this.current_tok.posStart ?? new Position(0, 0, 0, '', ''),
          this.current_tok.posEnd ?? new Position(0, 0, 0, '', ''),
          'Expected \'+\', \'-\', \'*\', or \'/\''
        )
      )
    }
    return res
  }

  expr (): ParseResult {
    return this.bin_op(() => this.term(), [TT_PLUS, TT_MINUS])
  }

  factor (): ParseResult {
    const res = new ParseResult()
    const tok = this.current_tok
    if (tok == null) throw new Error('null tok')

    if ([TT_PLUS, TT_MINUS].includes(tok.type)) {
      res.register(this.advance())
      const factor = res.register(this.factor())
      if (res.error != null) return res
      return res.success(new UnaryOpNode(tok, factor))
    } else if ([TT_INT, TT_FLOAT].includes(tok?.type)) {
      res.register(this.advance())
      return res.success(new NumberNode(tok))
    } else if (tok?.type === TT_LPAREN) {
      res.register(this.advance())
      const expr = res.register(this.expr())
      if (res.error != null) return res
      if (this.current_tok?.type === TT_RPAREN) {
        res.register(this.advance())
        return res.success(expr)
      } else {
        return res.failure(
          new InvalidSyntaxError(
            tok.posStart ?? new Position(0, 0, 0, '', ''),
            tok.posEnd ?? new Position(0, 0, 0, '', ''),
            'Expected \')\''
          )
        )
      }
    }

    return res.failure(
      new InvalidSyntaxError(
        tok.posStart ?? new Position(0, 0, 0, '', ''),
        tok.posEnd ?? new Position(0, 0, 0, '', ''),
        'Expected int or float'
      )
    )
  }

  term (): ParseResult {
    return this.bin_op(() => this.factor(), [TT_MUL, TT_DIV])
  }

  bin_op (func: () => ParseResult, ops: string[]): ParseResult {
    const res = new ParseResult()
    let left = res.register(func())
    if (res.error != null) return res

    while (this.current_tok != null && ops.includes(this.current_tok.type)) {
      const opTok = this.current_tok
      if (opTok == null) continue
      res.register(this.advance())
      const right = res.register(func())
      if (res.error != null) return res
      left = new BinOpNode(left, opTok, right)
    }

    return res.success(left)
  }
}

function stringWithArrows (text: string, posStart: Position, posEnd: Position): string {
  let result = ''

  let idxStart = Math.max(text.lastIndexOf('\n', posStart.idx), 0)
  let idxEnd = text.indexOf('\n', idxStart + 1)
  if (idxEnd < 0) idxEnd = text.length

  const lineCount = posEnd.ln - posStart.ln + 1

  for (let i = 0; i < lineCount; i++) {
    const line = text.slice(idxStart, idxEnd)
    const colStart = i === 0 ? posStart.col : 0
    const colEnd = i === lineCount - 1 ? posEnd.col : line.length - 1

    result += line + '\n'
    result += ' '.repeat(colStart) + '^'.repeat(colEnd - colStart)

    idxStart = idxEnd
    idxEnd = text.indexOf('\n', idxStart + 1)
    if (idxEnd < 0) idxEnd = text.length
  }

  return result.replace('\t', '')
}

function run (fn: string, text: string): [any, ASTError | null] {
  if (text === 'exit') {
    return ['exit', null]
  }

  const lexer = new Lexer(fn, text)
  const [tokens, error] = lexer.make_tokens()
  if (error != null) return [null, error]

  const parser = new Parser(tokens)
  const ast = parser.parse()

  return [ast.node, ast.error]
}

// Uncomment to use in an interactive environment
if (typeof require !== 'undefined' && require.main === module) {
  const readline = ReadLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.on('line', (text: string) => {
    if (text === 'exit') {
      readline.close()
      return
    }

    const [result, error] = run('<stdin>', text)

    if (error != null) {
      console.log(error.toString())
    } else {
      console.log(util.inspect(result, false, null, true))
    }
  })
}

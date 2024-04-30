export interface ParserResponse { accepted: boolean, AST: AbstractSyntaxTree | undefined }

export class Parser {
  private stack: Token[] = []
  private buffer: Token[] = []
  private readonly grammar: Grammar
  private readonly ASTNodeStack: any[] = []

  constructor (grammar: Grammar) {
    this.grammar = grammar
  }

  public parse (tokenStream: TokenStream): ParserResponse {
    this.buffer = tokenStream.getTokens()
    this.stack = [new Token('STACK_MARKER', '$')]
    const startSymbol = this.grammar.startSymbol

    while (this.buffer.length > 0) {
      this.shift()
      this.findMatchAndReduce()
    }
    if (this.stack.length == 2 && this.stack[1].value === startSymbol) {
      return { accepted: true, AST: this.ASTNodeStack.pop() }
    }
    return { accepted: false, AST: undefined }
  }

  public findMatchAndReduce () {
    for (let i = 0; i < this.stack.length; ++i) {
      const tokenSlice = this.stack.slice(i)
      const tokenSliceWord = this.getStringFrom(tokenSlice)
      const productionsWithSuitableRhs = this.getProductionWithRHS(tokenSliceWord)

      if (
        this.buffer.length == 0 &&
                this.stack.length == 2 &&
                this.stack[1].value === this.grammar.startSymbol
      ) return
      if (productionsWithSuitableRhs.length > 0) {
        this.reduce(tokenSlice, productionsWithSuitableRhs[0].left)
        i = -1
      }
    }
  }

  public shift () {
    const token = this.buffer.shift()
    this.stack.push(token as Token)
    this.ASTNodeStack.push(token)
  }

  public reduce (sequence: Token[], lhs: string) {
    const tempAstLeaves = []
    for (let i = 0; i < sequence.length; ++i) {
      this.stack.pop()
      tempAstLeaves.push(this.ASTNodeStack.pop())
    }
    this.ASTNodeStack.push(new AbstractSyntaxTreeNode(lhs, tempAstLeaves))
    this.stack.push(new Token('NON_TERMINAL', lhs))
  }

  public getStringFrom (tokens: Token[]): string {
    let word: string = ''
    tokens.forEach(token => {
      word += token.value
    })
    return word
  }

  public getProductionWithRHS (rhs: string): Production[] {
    return this.grammar.productions.filter(production => production.right === rhs)
  }
}

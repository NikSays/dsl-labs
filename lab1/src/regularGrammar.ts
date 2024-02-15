export type NonTerminal = string
export type Terminal = string
export enum RegularGrammarType {
  left,
  right
}

export default class RegularGrammar {
  readonly start: NonTerminal
  readonly nonTerminals: NonTerminal[]
  readonly terminals: Terminal[]
  readonly rules: Record<NonTerminal, string[]> // array of productions for a nonTerminal
  readonly type: RegularGrammarType

  constructor (
    start: NonTerminal,
    nonTerminals: NonTerminal[],
    terminals: Terminal[],
    rules: Record<NonTerminal, string[]>
  ) {
    this.start = start
    this.nonTerminals = nonTerminals
    this.terminals = terminals
    this.rules = rules

    // Validate the grammar
    if (this.nonTerminals.some(symbol => symbol.length !== 1)) {
      throw new Error('Non-terminal symbols must be exactly one character')
    }
    if (this.terminals.some(symbol => symbol.length !== 1)) {
      throw new Error('Terminal symbols must be exactly one character')
    }
    if (!this.nonTerminals.includes(this.start)) {
      throw new Error('Start symbol must be non-terminal')
    }
    if (this.nonTerminals.some(symbol => this.terminals.includes(symbol))) {
      throw new Error('Non-terminals and terminals must not overlap')
    }
    if (Object.keys(this.rules).some(leftSide => !this.nonTerminals.includes(leftSide))) {
      throw new Error('Left side of a production must be a non-terminal.')
    }
    const rightSides = Object.values(this.rules).flat()
    if (rightSides.filter(rightSide => rightSide.length === 1).some(rightSide => !this.terminals.includes(rightSide))) {
      throw new Error('Right side of a production must have exactly 1 terminal and at most one non-terminal')
    }

    this.type = this.getType()
  }

  private getType (): RegularGrammarType {
    let left = false
    let right = false

    const rightSides = Object.values(this.rules).flat()
    for (const rightSide of rightSides.filter(rightSide => rightSide.length === 2)) {
      if (this.terminals.includes(rightSide[0]) && this.nonTerminals.includes(rightSide[1])) {
        // A -> bC
        right = true
      } else if (this.nonTerminals.includes(rightSide[0]) && this.terminals.includes(rightSide[1])) {
        // A -> Bc
        left = true
      } else {
        // A -> BC
        throw new Error('Right side of a production must have exactly 1 terminal and at most one non-terminal')
      }
    }

    if (left && right) throw new Error('Mixed left and right regular grammar')

    if (right) return RegularGrammarType.right
    else return RegularGrammarType.left
  }

  // Checks for non-terminals in the string
  private isTerminalString (str: string): boolean {
    for (const symbol of str) {
      if (this.nonTerminals.includes(symbol)) { return false }
    }
    return true
  }

  // Returns a random production for the given non-terminal
  private randomProduction (nonTerminal: string): string {
    return this.rules[nonTerminal][Math.floor(Math.random() * this.rules[nonTerminal].length)]
  }

  // Replace first non-terminal with a random production (if found)
  private produceFirstNonTerminal (str: string): string {
    let firstNonTerminal = ''
    for (const symbol of str) {
      if (this.nonTerminals.includes(symbol)) {
        firstNonTerminal = symbol
      }
    }
    if (firstNonTerminal === '') {
      return str
    }
    return str.replace(firstNonTerminal, this.randomProduction(firstNonTerminal))
  }

  // Generates a random word in the language
  public generateWord (): string {
    let word = this.start
    while (!this.isTerminalString(word)) {
      word = this.produceFirstNonTerminal(word)
    }
    return word
  }
}

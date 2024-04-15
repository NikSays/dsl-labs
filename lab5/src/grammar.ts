export type NonTerminal = string
export type Terminal = string
export type Sym = NonTerminal | Terminal
export interface Rule { left: Sym[], right: Sym[] }
export enum GrammarType {
  leftRegular = 'Left Regular',
  rightRegular = 'Right Regular',
  contextFree = 'Context Free',
  contextSensitive = 'Context Sensitive',
  recursivelyEnumerable = 'Recursively Enumerable'
}

export const epsilon = 'ε'

export default class Grammar {
  readonly start: NonTerminal
  readonly nonTerminals: NonTerminal[]
  readonly terminals: Terminal[]
  readonly rules: Rule[]
  readonly type: GrammarType

  constructor (
    start: NonTerminal,
    nonTerminals: NonTerminal[],
    terminals: Terminal[],
    rules: Array<{ left: Sym[], right: Sym[] }>
  ) {
    this.start = start
    this.nonTerminals = nonTerminals
    this.terminals = terminals
    this.rules = rules

    // Validate the grammar
    if (!this.nonTerminals.includes(this.start)) {
      throw new Error('Start symbol must be non-terminal')
    }
    if (this.nonTerminals.some(symbol => this.terminals.includes(symbol))) {
      throw new Error('Non-terminals and terminals must not overlap')
    }
    if (this.nonTerminals.includes(epsilon)) {
      throw new Error('Epsilon cannot be non-terminal')
    }
    for (const rule of this.rules) {
      if (rule.left.some(symbol => !this.nonTerminals.includes(symbol) && !this.terminals.includes(symbol))) {
        throw new Error('Left side of a production must consist of non-terminals and terminals.')
      }
      if (rule.right.some(symbol => !this.nonTerminals.includes(symbol) && !this.terminals.includes(symbol) && symbol !== epsilon)) {
        throw new Error('Right side of a production must consist of non-terminals and terminals.')
      }
    }

    this.type = this.getType()
  }

  private getType (): GrammarType {
    // A -> ?
    if (this.rules.every(rule => rule.left.length === 1 && this.nonTerminals.includes(rule.left[0]))) {
      // A -> bC or A -> Bc
      if (this.rules.every(rule => (rule.right.length === 1 && this.terminals.includes(rule.right[0])) || rule.right.length === 2)) {
        const twoSymRights = this.rules.filter(rule => rule.right.length === 2).map(rule => rule.right)
        // A -> bC
        if (twoSymRights.every(right => this.terminals.includes(right[0]) && this.nonTerminals.includes(right[1]))) {
          return GrammarType.rightRegular
        }
        // A -> Bc
        if (twoSymRights.every(right => this.nonTerminals.includes(right[0]) && this.terminals.includes(right[1]))) {
          return GrammarType.leftRegular
        }
      }
      // A -> bCd
      return GrammarType.contextFree
    }
    // aBc -> a?c
    if (this.rules.every(rule => rule.left.length <= rule.right.length)) {
      return GrammarType.contextSensitive
    }
    // ? -> ?
    return GrammarType.recursivelyEnumerable
  }
}

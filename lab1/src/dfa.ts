export type State = string
export type Sym = string
// {CurrentState: {transition: newState}}
export type Transitions = Record<State, Record<Sym, State>>

export default class DeterministicFiniteAutomaton {
  protected readonly states: State[] // Q
  protected readonly alphabet: Sym[] // Sigma
  protected readonly transitions: Transitions // delta
  protected readonly startingState: State // q0
  protected readonly finalStates: State[] // F

  constructor (
    states: State[],
    alphabet: Sym[],
    transitions: Transitions,
    startingState: State,
    finalStates: State[]
  ) {
    this.states = states
    this.alphabet = alphabet
    this.transitions = transitions
    this.startingState = startingState
    this.finalStates = finalStates

    // Validate the DFA
    if (!this.states.includes(startingState)) {
      throw new Error('States must include the starting state')
    }
    if (this.alphabet.some(symbol => symbol.length !== 1)) {
      throw new Error('Symbols of the alphabet must be exactly one character')
    }
    if (this.finalStates.some(state => !this.states.includes(state))) {
      throw new Error('States must include all final states')
    }
    if (Object.keys(this.transitions).some(currentState => !this.states.includes(currentState))) {
      throw new Error('The current state in a transition must be a valid state')
    }
    for (const transition of Object.values(this.transitions)) {
      if (Object.keys(transition).some(symbol => !this.alphabet.includes(symbol))) {
        throw new Error('The transition symbol must be a part of the alphabet')
      }
      if (Object.values(transition).some(newState => !this.states.includes(newState))) {
        throw new Error('The new state in a transition must be a valid state')
      }
    }
  }

  // Passes the string left-to-right. Invert the string beforehand if the grammar is left-regular
  isValid (str: string): boolean {
    let currentState = this.startingState
    for (const symbol of str) {
      const newState = this.transitions[currentState]?.[symbol]
      if (newState === null) {
        return false
      }
      currentState = newState
    }
    return this.finalStates.includes(currentState)
  }
}

import Grammar from './grammar'
import { arrayIncludesArray } from './arrayUtils'

export type State = string
export type Sym = string
// {beforeState: {transitionSymbol: afterStates}}
export type Transitions = Record<State, Record<Sym, State[]>>

export default class FiniteAutomaton {
  readonly states: State[] // Q
  readonly alphabet: Sym[] // Sigma
  readonly transitions: Transitions // delta
  readonly startingState: State // q0
  readonly finalStates: State[] // F

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
    if (Object.keys(this.transitions).some(beforeState => !this.states.includes(beforeState))) {
      throw new Error('The before-state in a transition must be a valid state')
    }
    for (const transition of Object.values(this.transitions)) {
      if (Object.keys(transition).some(symbol => !this.alphabet.includes(symbol))) {
        throw new Error('The transition symbol must be a part of the alphabet')
      }
      if (Object.values(transition).some(afterStates => afterStates.some(state => !this.states.includes(state)))) {
        // console.log(transition, this.states)
        throw new Error('The after-state in a transition must be a valid state')
      }
    }
  }

  //
  isDeterministic (): boolean {
    // All transitions can result only in one state
    return Object.values(this.transitions).every(transition => Object.values(transition).every(afterState => afterState.length === 1))
  }

  toDeterministic (): FiniteAutomaton {
    // Return a copy of the object if nothing has to be done
    if (this.isDeterministic()) return structuredClone(this)

    const stateGroups: State[][] = [[this.startingState]]
    const processedStateGroups: State[][] = []
    const nfaTransitions: Transitions = {}
    const finalStateGroups: State[][] = []

    // There are new states we haven't considered
    while (processedStateGroups.length < stateGroups.length) {
      // Find the unprocessed states
      const unprocessedStateGroups = stateGroups.filter(stateGroup => !arrayIncludesArray(processedStateGroups, stateGroup))
      unprocessedStateGroups.forEach(unprocessedStateGroup => {
        // Create the name for the state in form q0_q1_q2
        const newBeforeState = unprocessedStateGroup.sort().join('_')
        // Initialize the transition
        if (nfaTransitions[newBeforeState] === undefined) nfaTransitions[newBeforeState] = {}
        // For every transition that starts with one of the sub-states in q0_q1_q2
        Object.keys(this.transitions)
          .filter(beforeState => unprocessedStateGroup.includes(beforeState))
          .forEach(beforeState => {
            Object.entries(this.transitions[beforeState]).forEach(([transitionSymbol, afterStates]) => {
              if (nfaTransitions[newBeforeState][transitionSymbol] === undefined) nfaTransitions[newBeforeState][transitionSymbol] = []
              // Add the possible resulting state as a sub-state in the resulting state
              afterStates
                .filter(state => !nfaTransitions[newBeforeState][transitionSymbol].includes(state))
                .forEach(state => nfaTransitions[newBeforeState][transitionSymbol].push(state))
            })
          })
        Object.values(nfaTransitions[newBeforeState]).forEach(newAfterStates => {
          // Add the after-state as a new state to be processed in the next loop
          if (!arrayIncludesArray(stateGroups, newAfterStates)) stateGroups.push(newAfterStates)
          // If the after-state contains a final sub-state, the whole state is final
          if (newAfterStates.some(newState => this.finalStates.includes(newState)) && !arrayIncludesArray(finalStateGroups, newAfterStates)) finalStateGroups.push(newAfterStates)
        })
        processedStateGroups.push(unprocessedStateGroup)
      })
    }

    // Join the sub-states in a string q0_q1_q2
    const states: State[] = stateGroups.map(stateGroup => stateGroup.join('_'))
    const finalStates: State[] = finalStateGroups.map(finalStateGroup => finalStateGroup.join('_'))
    Object.keys(nfaTransitions).forEach(beforeState => { Object.keys(nfaTransitions[beforeState]).forEach(transitionSymbol => { nfaTransitions[beforeState][transitionSymbol] = [nfaTransitions[beforeState][transitionSymbol].sort().join('_')] }) })

    return new FiniteAutomaton(states, this.alphabet, nfaTransitions, this.startingState, finalStates)
  }

  toRightRegularGrammar (): Grammar {
    if (!this.isDeterministic()) {
      throw new Error('Only deterministic automata can be converted to a regular grammar')
    }
    // Add the A->bC rule for every transition
    const rules = Object.entries(this.transitions).map(([currentState, transitions]) =>
      Object.entries(transitions).map(([transition, newStates]) =>
        newStates.map(newState => ({ left: [currentState], right: [transition, newState] }))
      )
    ).flat(2)
    // Add the A->ε rule for every final state
    rules.push(...this.finalStates.map(state => ({ left: [state], right: ['epsilon'] })))
    return new Grammar(this.startingState, this.states, [...this.alphabet, 'epsilon'], rules)
  }
}

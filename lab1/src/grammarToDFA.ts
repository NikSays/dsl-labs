import DeterministicFiniteAutomaton, { type State, type Transitions } from './dfa'
import type RegularGrammar from './regularGrammar'
import { RegularGrammarType } from './regularGrammar'

export default function grammarToDFA (g: RegularGrammar): DeterministicFiniteAutomaton {
  const finalState: State = 'FINAL'

  const transitions: Transitions = {}

  Object.keys(g.rules).forEach(nonTerminal => {
    transitions[nonTerminal] = {}
  })

  for (const [nonTerminal, productions] of Object.entries(g.rules)) {
    productions.forEach(production => {
      if (production.length === 1) {
        // A -> b  to  A -b-> FINAL
        transitions[nonTerminal][production] = finalState
      } else if (g.type === RegularGrammarType.right) {
        // A -> bC  to  A -b-> C
        const transition = production[0]
        const newState = production[1]
        transitions[nonTerminal][transition] = newState
      } else if (g.type === RegularGrammarType.left) {
        // A -> Cb  to  A -b-> C
        const transition = production[1]
        const newState = production[0]
        transitions[nonTerminal][transition] = newState
      }
    })
  }

  return new DeterministicFiniteAutomaton(
    [...g.nonTerminals, finalState], // States
    g.terminals, // Alphabet
    transitions,
    g.start, // Starting state
    [finalState] // Final state
  )
}

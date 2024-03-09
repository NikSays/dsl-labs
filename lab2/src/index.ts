import FiniteAutomaton from './automaton'

const nfa = new FiniteAutomaton(
  ['q0', 'q1', 'q2'],
  ['a', 'b'],
  {
    q0: { a: ['q0'], b: ['q1'] },
    q1: { a: ['q0'], b: ['q1', 'q2'] },
    q2: { b: ['q1'] }

  },
  'q0',
  ['q2']
)
// const nfa = new FiniteAutomaton(
//   ['q0', 'q1', 'q2', 'q3'],
//   ['a', 'b', 'c'],
//   {
//     q0: { a: ['q0', 'q1'] },
//     q1: { b: ['q2'] },
//     q2: { a: ['q2'], c: ['q3'] },
//     q3: { c: ['q3'] }
//   },
//   'q0',
//   ['q3']
// )

console.log(nfa.isDeterministic() ? 'Deterministic' : 'Non-deterministic')
console.log('Starting state:', nfa.startingState)
console.log('States: ', nfa.states)
console.log('Alphabet: ', nfa.alphabet)
console.log('Rules: ')
Object.entries(nfa.transitions).forEach(([beforeState, transition]) => {
  Object.entries(transition).forEach(([transitionSymbol, afterState]) => {
    console.log(`    ${beforeState} -${transitionSymbol}-> ${afterState.join('|')}`)
  })
})

console.log()

const dfa = nfa.toDeterministic()
console.log(dfa.isDeterministic() ? 'Deterministic' : 'Non-deterministic')
console.log('Starting state:', dfa.startingState)
console.log('States: ', dfa.states)
console.log('Alphabet: ', dfa.alphabet)
console.log('Rules: ')
Object.entries(dfa.transitions).forEach(([beforeState, transition]) => {
  Object.entries(transition).forEach(([transitionSymbol, afterState]) => {
    console.log(`    ${beforeState} -${transitionSymbol}-> ${afterState.join('|')}`)
  })
})

// console.log(dfa)
const grammar = dfa.toRightRegularGrammar()
console.log('\nGrammar')
console.log('Type:', grammar.type)
console.log('Non-terminals:', grammar.nonTerminals)
console.log('Terminals: ', grammar.terminals)
console.log('Start symbol: ', grammar.start)
console.log('Productions:')

grammar.rules.forEach(rule => {
  console.log(`    ${rule.left.join(' ')} -> ${rule.right.join(' ')}`)
})
Object.entries(dfa.transitions).forEach(([beforeState, transition]) => {
  Object.entries(transition).forEach(([transitionSymbol, afterState]) => {
    console.log(`    ${beforeState} -${transitionSymbol}-> ${afterState.join('|')}`)
  })
})
// console.log(grammar)

import CNFFullConversion from './convert'
import Grammar, { epsilon } from './grammar'

const cnf = CNFFullConversion(new Grammar(
  'S',
  ['S', 'A', 'B', 'C', 'D'],
  ['a', 'b'],
  [
    { left: ['S'], right: ['A', 'C'] },
    { left: ['S'], right: ['b', 'A'] },
    { left: ['S'], right: ['B'] },
    { left: ['S'], right: ['a', 'A'] },
    { left: ['A'], right: [epsilon] },
    { left: ['A'], right: ['a', 'S'] },
    { left: ['A'], right: ['A', 'B', 'A', 'b'] },
    { left: ['B'], right: ['a'] },
    { left: ['B'], right: ['A', 'b', 'S', 'A'] },
    { left: ['C'], right: ['a', 'b', 'C'] },
    { left: ['D'], right: ['A', 'B'] }
  ]
))
// const cnf = CNFFullConversion(new Grammar(
//   'S',
//   ['S', 'A', 'B', 'C', 'E'],
//   ['a', 'b'],
//   [
//     { left: ['S'], right: ['a', 'B'] },
//     { left: ['S'], right: ['A', 'C'] },
//     { left: ['A'], right: ['a'] },
//     { left: ['A'], right: ['A', 'C', 'S', 'C'] },
//     { left: ['A'], right: ['B', 'C'] },
//     { left: ['B'], right: ['b'] },
//     { left: ['B'], right: ['a', 'A'] },
//     { left: ['C'], right: [epsilon] },
//     { left: ['C'], right: ['B', 'A'] },
//     { left: ['E'], right: ['b', 'B'] }
//   ]
// ))
console.log('\nGrammar')
console.log('Type:', cnf.type)
console.log('Non-terminals:', cnf.nonTerminals)
console.log(cnf.nonTerminals.length, 'Non-terminals')

console.log('Terminals: ', cnf.terminals)
console.log('Start symbol: ', cnf.start)
console.log('Productions:')

cnf.rules
  .sort((a, b) => a.left.join().localeCompare(b.left.join()))
  .forEach(rule => {
    console.log(`    ${rule.left.join(' ')} -> ${rule.right.join(' ')}`)
  })
console.log(cnf.rules.length, 'Productions')

import RegularGrammar, { RegularGrammarType } from './regularGrammar'
import grammarToDFA from './grammarToDFA'
import * as readline from 'node:readline'

const g = new RegularGrammar(
  'S',
  ['S', 'B', 'C'],
  ['a', 'b', 'c'],
  {
    S: ['aB'],
    B: ['aC', 'bB'],
    C: ['bB', 'aS', 'c']
  }
)

console.log('5 Random Words:')
for (let i = 0; i < 5; i++) {
  console.log(g.generateWord())
}
console.log()

const dfa = grammarToDFA(g)

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const readInput = (): void => {
  reader.question('Input a string to check: ', (word: string) => {
    if (g.type === RegularGrammarType.left) {
      word = word.split('').reverse().join('') // Reverse
    }
    if (dfa.isValid(word)) {
      console.log('Valid')
    } else {
      console.log('Invalid')
    }
    readInput()
  })
}

readInput()

import Lexer from './lexer'
import TokenMatcher, { type Token } from './tokenMatcher'

const tokens: Token[] = [
  { name: 'comment', regex: '//[^\n]*' },
  { name: 'string', regex: '"[^"]*"' },
  { name: 'reserved', regex: 'if|else|while|for' },
  { name: 'numeric', regex: '[0-9]+(\\.[0-9]+)?' },
  { name: 'symbol', regex: '[{}()*/+\\-=<>,!;]' },
  { name: 'alphanum', regex: '[a-zA-Z][a-zA-Z0-9_]*' },
  { name: 'whitespace', regex: '\\s+' }
]
const program = `
// Print "hello world" 10 times,
// but with a twist

counter_1 = 10;
while(counter_1 > 0) {
  if (counter_1 == 5) {
    print("boo!");
  } else {
    print("hello world");
  }
  counter_1 = counter_1 - 1;
}
`
const tokenMatcher = new TokenMatcher(tokens)
const lexer = new Lexer(tokenMatcher)
const tokenMatches = lexer.process(program)

// Pretty print
tokenMatches.forEach((match) => {
  if (match.tokenName === 'whitespace') process.stdout.write(match.value)
  else process.stdout.write(`(${match.tokenName} '${match.value}') `)
})
process.stdout.write('\n')

import { type Match } from './tokenMatcher'
import type TokenMatcher from './tokenMatcher'

export default class Lexer {
  private readonly tokenMatcher: TokenMatcher

  constructor (tokenMatcher: TokenMatcher) {
    this.tokenMatcher = tokenMatcher
  }

  process (program: string): Match[] {
    const result: Match[] = []
    while (true) {
      const match = this.tokenMatcher.findFirstMatch(program)
      if (match === null) break // nothing left to match

      result.push(match) // save match

      program = program.replace(match.value, '') // remove match from unprocessed string
    }
    // Group all dangling string
    if (program.length > 0) result.push({ tokenName: '__UNMATCHED__', value: program })

    return result
  }
}

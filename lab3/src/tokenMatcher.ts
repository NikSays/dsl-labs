export interface Token {
  name: string
  regex: string
}

interface WrappedToken {
  name: string
  regex: RegExp
}

export interface Match {
  tokenName: string
  value: string
}

export default class TokenMatcher {
  private readonly tokens: WrappedToken[]
  constructor (unwrappedTokens: Token[]) {
    // Anything in the regex must be at the beginning of the string.
    // Parenthesis required to avoid /^a|b|c/ matching b and c anywhere
    this.tokens = unwrappedTokens.map(token => ({ name: token.name, regex: new RegExp(`^(${token.regex})`) }))
  }

  findFirstMatch (str: string): Match | null {
    // That's why the order of rules matters
    for (const token of this.tokens) {
      const result = token.regex.exec(str)
      if (result === null) continue
      if (result.length > 0) return { tokenName: token.name, value: result[0] }
    }
    return null
  }
}

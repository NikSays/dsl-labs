import { arrayEq, getPosition } from './arrayUtils'
import Grammar, { epsilon, type Sym, type Rule, type NonTerminal } from './grammar'

export default function CNFFullConversion (grammar: Grammar): Grammar {
  if (!grammar.rules.every(rule => rule.left.length === 1 && grammar.nonTerminals.includes(rule.left[0]))) {
    throw new Error('Not a Context-Free Grammar (LHS not 1 NT)')
  }
  let cnf: Grammar = Object.assign(grammar)
  cnf = removeEpsilon(cnf)
  cnf = removeRenaming(cnf)
  cnf = removeInaccessible(cnf)
  cnf = removeNonProductive(cnf)
  cnf = toCNF(cnf)
  return cnf
}

function removeEpsilon (grammar: Grammar): Grammar {
  let rules = grammar.rules
  while (true) {
    const epsilonRuleIndex = rules.findIndex(rule => arrayEq(rule.right, [epsilon]))
    if (epsilonRuleIndex === -1) break
    const epsilonRule = rules[epsilonRuleIndex]
    rules = [
      ...rules.slice(0, epsilonRuleIndex),
      ...rules.slice(epsilonRuleIndex + 1)
    ]
    // todo delete if no left????
    let changed = true
    while (changed) {
      changed = false
      rules.filter(rule => rule.right.includes(epsilonRule.left[0]))
        .forEach(
          rule => {
            if (rule === undefined) return

            let i = 0
            while (true) {
              const first = getPosition(rule.right, epsilonRule.left[0], i)
              if (first === -1) break
              const newRight = [...rule.right.slice(0, first), ...rule.right.slice(first + 1)]
              const newRule = { left: rule.left, right: newRight }
              if (rules.some(r => arrayEq(r.left, newRule.left) && arrayEq(r.right, newRule.right))) {
                i++
                continue
              }
              changed = true
              rules.push(newRule)
            }
          }
        )
    }
  }

  // uniqueRules?
  return new Grammar(grammar.start, grammar.nonTerminals, grammar.terminals, rules)
}

function removeRenaming (grammar: Grammar): Grammar {
  let rules: Rule[] = grammar.rules

  while (true) {
    const renameRuleIndex = rules
      .findIndex(rule => rule.right.length === 1 && grammar.nonTerminals.includes(rule.right[0]))
    if (renameRuleIndex === -1) break
    const renameRule = rules[renameRuleIndex]

    rules = [
      ...rules.slice(0, renameRuleIndex),
      ...rules.slice(renameRuleIndex + 1)
    ]
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.left[0] !== renameRule.right[0]) continue

      rules.push({ left: renameRule.left, right: rule.right })
    }
    rules = rules.filter((v, i, a) => a.findIndex(r => arrayEq(r.left, v.left) && arrayEq(r.right, v.right)) === i)
  }
  return new Grammar(grammar.start, grammar.nonTerminals, grammar.terminals, rules)
}

function getAccessibleSymbols (grammar: Grammar): Sym[] {
  const accessible: Sym[] = [grammar.start]
  const visited: Sym[] = []

  while (!arrayEq(accessible, visited)) {
    accessible
      .filter(sym => !visited.includes(sym))
      .forEach(unvisited => {
        grammar.rules
          .filter(rule => rule.left[0] === unvisited)
          .forEach(rule => {
            rule.right
              .filter(sym => !accessible.includes(sym))
              .forEach(sym => accessible.push(sym))
          })
        visited.push(unvisited)
      })
  }
  return accessible
}
function removeInaccessible (grammar: Grammar): Grammar {
  const accessible = getAccessibleSymbols(grammar)

  const nonTerminals = grammar.nonTerminals.filter(sym => accessible.includes(sym))
  const terminals = grammar.terminals.filter(sym => accessible.includes(sym))
  const rules = grammar.rules.filter(rule => accessible.includes(rule.left[0]))
  return new Grammar(grammar.start, nonTerminals, terminals, rules)
}

function removeNonProductive (grammar: Grammar): Grammar {
  const productive: NonTerminal[] = []
  grammar.rules
    .filter(rule => rule.right.every(sym => grammar.terminals.includes(sym)))
    .map(rule => rule.left[0])
    .forEach(sym => {
      if (!productive.includes(sym)) productive.push(sym)
    })

  let changed = true
  while (changed) {
    changed = false
    grammar.rules
      .filter(rule => rule.right.every(sym => grammar.terminals.includes(sym) || productive.includes(sym)))
      .map(rule => rule.left[0])
      .forEach(sym => {
        if (!productive.includes(sym)) {
          changed = true
          productive.push(sym)
        }
      })
  }

  const rules = grammar.rules.filter(rule => rule.right.every(sym => grammar.terminals.includes(sym) || productive.includes(sym)))
  const nonTerminals = productive
  return new Grammar(grammar.start, nonTerminals, grammar.terminals, rules)
}

function toCNF (grammar: Grammar): Grammar {
  const rules: Rule[] = []
  const nonTerminals = grammar.nonTerminals
  grammar.rules.forEach(rule => {
    if (rule.right.length === 1) {
      rules.push(rule)
      return
    } // len > 1
    if (rule.right.length === 2 && rule.right.every(sym => grammar.nonTerminals.includes(sym))) {
      rules.push(rule)
      return
    }
    rules.push(rule)
    rule.right.forEach((sym, i) => {
      if (grammar.terminals.includes(sym)) {
        const newName = findNewName(rules, [...nonTerminals, ...grammar.terminals], [sym])
        addSymbol(nonTerminals, newName)
        addRule(rules, { left: [newName], right: [sym] })
        rule.right[i] = newName
      }
    })

    while (rule.right.length > 2) {
      const joined = [rule.right[rule.right.length - 2], rule.right[rule.right.length - 1]]
      const newName = findNewName(rules, [...grammar.nonTerminals, ...grammar.terminals], joined)
      rule.right = rule.right.slice(0, -2)
      addSymbol(nonTerminals, newName)
      addRule(rules, { left: [newName], right: joined })
      rule.right.push(newName)
    }
  })
  return new Grammar(grammar.start, nonTerminals, grammar.terminals, rules)
}

function findNewName (rules: Rule[], symbols: Sym[], right: Sym[]): string {
  const leftsWithsameRight = rules.filter(rule => arrayEq(rule.right, right)).map(rule => rule.left)
  const sameRule = leftsWithsameRight.filter(left => rules.filter(rule => arrayEq(rule.left, left)).length === 1)
  if (sameRule.length > 0) return sameRule[0][0]
  let i = 0

  while (true) {
    const name = `${i}`
    if (!symbols.includes(name)) return name
    else i++
  }
}

function addRule (rules: Rule[], rule: Rule): void {
  if (rules.some(r => arrayEq(r.left, rule.left) && arrayEq(r.right, rule.right))) return
  rules.push(rule)
}

function addSymbol (symbols: Sym[], symbol: Sym): void {
  if (symbols.includes(symbol)) return
  symbols.push(symbol)
}

# Lab 3: Lexer & Scanner

### Course: Formal Languages & Finite Automata
### Author: Nejintev Nicolai

----

<br>

## Objectives

1. Understand what lexical analysis is.
2. Get familiar with the inner workings of a lexer/scanner/tokenizer.
3. Implement a sample lexer and show how it works.

## Theory
A lexer, also known as a lexical analyzer, is a software component designed to receive a string of characters as input and produce a series of tokens as output. These tokens represent meaningful elements of text, such as keywords, identifiers, operators, and punctuation marks, fundamental in a programming or formal language.

The primary task of the lexer involves identifying these tokens through a process of examining the input text and comparing it with predetermined patterns or regular expressions. The goal of lexical analysis is to abstract the source code into a more manageable format for the following stages of the compilation or interpretation. Through the recognition and classification of tokens, lexical analysis helps to build a structured representation of the source code, utilized by the parser to construct an abstract syntax tree (AST)

## Implementation description
### Tokens
I've used Regular Expressions to tokenize the code. The TokenMatcher class has a method that allows to compare the string with the provided expressions. The matching occurs only at the beginning of the string, so if the RegExp `/abc/` was provided, `/^(abc)/` will be matched. 

The order of the tokens given to the TokenMatcher matters, since the rules are tested always in the same order. If all rules fail, null is returned.

### Lexer
Lexer takes the program string and feeds it to its internal TokenMatcher. If a token was found, it is saved, cut from the string, and the token matching is repeated with the new string, to find the next token. This is repeated until the TokenMatcher returns null. If at this point something remains in the program, it gets put into the `__UNMATCHED__` token.


## Execution

* Install `node.js` and `npm` 
* Install the dependencies 
  ```sh
  npm install
  ```
* Run the project
  ```sh
  npm run start
  ```

## Example
Tokens:
```
comment -> //[^\n]*
string -> "[^"]*"
reserved -> if|else|while|for
numeric -> [0-9]+(\\.[0-9]+)?
symbol -> [{}()*/+\\-=<>,!;]
alphanum -> [a-zA-Z][a-zA-Z0-9_]*
whitespace -> \\s+
```
Program:
```go
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
```
Tokenized:
```shell
(comment '// Print "hello world" 10 times,') 
(comment '// but with a twist') 

(alphanum 'counter_1')  (symbol '=')  (numeric '10') (symbol ';') 
(reserved 'while') (symbol '(') (alphanum 'counter_1')  (symbol '>')  (numeric '0') (symbol ')')  (symbol '{') 
  (reserved 'if')  (symbol '(') (alphanum 'counter_1')  (symbol '=') (symbol '=')  (numeric '5') (symbol ')')  (symbol '{') 
    (alphanum 'print') (symbol '(') (string '"boo!"') (symbol ')') (symbol ';') 
  (symbol '}')  (reserved 'else')  (symbol '{') 
    (alphanum 'print') (symbol '(') (string '"hello world"') (symbol ')') (symbol ';') 
  (symbol '}') 
  (alphanum 'counter_1')  (symbol '=')  (alphanum 'counter_1')  (symbol '-')  (numeric '1') (symbol ';') 
(symbol '}') 
```


## Conclusion 
The design and implementation of a lexer constitute a crucial phase in compiler or interpreter development. Through this laboratory work, I've deepened my understanding of lexer components like tokenization and regular expressions.

Throughout the project, I researched lexer components, such as keyword identification, identifier handling, and rule definition, resulting in a robust lexer capable of accurately tokenizing input text.
The skills I got from this laboratory work provide a solid understanding of the compilation process. 
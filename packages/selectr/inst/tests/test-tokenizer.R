context("tokenizer")

test_that("tokenizer extracts correct representation", {
    tokens <- tokenize('E\ é > f [a~="y\"x"]:nth(/* fu /]* */-3.7)')
    tokens <- unlist(lapply(tokens, function(x) x$repr()))
    expected_tokens <- c("<IDENT 'E é' at 0>",
                         "<S ' ' at 4>",
                         "<DELIM '>' at 5>",
                         "<S ' ' at 6>",
                         # the no-break space is not whitespace in CSS
                         "<IDENT 'f ' at 7>",  # f\xa0
                         "<DELIM '[' at 9>",
                         "<IDENT 'a' at 10>",
                         "<DELIM '~' at 11>",
                         "<DELIM '=' at 12>",
                         "<STRING 'y\"x' at 13>",
                         "<DELIM ']' at 19>",
                         "<DELIM ':' at 20>",
                         "<IDENT 'nth' at 21>",
                         "<DELIM '(' at 24>",
                         "<NUMBER '-3.7' at 37>",
                         "<DELIM ')' at 41>",
                         "<EOF at 42>")
    expect_that(tokens, equals(expected_tokens)) 
})

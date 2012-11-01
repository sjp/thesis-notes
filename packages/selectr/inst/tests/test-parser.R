context("parser")

test_that("parser parses ", {
    repr_parse <- function(css) {
        selectors <- parse(css)
        n <- length(selectors)
        result <- character(n)
        for (i in 1:n) {
            selector <- selectors[[i]]
            selector$parsed_tree$repr()
        }
        result
    }

    parse_many <- function(first, others) {
        result <- repr_parse(first)
        for (other in others) {
            if (repr_parse(other) != result)
                stop("other != parsed_result")
        }
        result
    }

    expect_that(parse_many("*"), equals("Element[*]"))
    expect_that(parse_many("*|*"), equals("Element[*]"))
    expect_that(parse_many("*|foo"), equals("Element[foo]"))
    expect_that(parse_many("foo|*"), equals("Element[foo|*]"))
    expect_that(parse_many("foo|bar"), equals("Element[foo|bar]"))
    # This will never match, but it is valid:
    expect_that(parse_many("#foo#bar"),
                equals("Hash[Hash[Element[*]]#foo]#bar"))
    expect_that(parse_many(c("div>.foo",
                        "div> .foo",
                        "div >.foo",
                        "div > .foo",
                        "div > .foo",
                        "div \n>  \t \t .foo",
                        "div\r>\n\n\n.foo",
                        "div\f>\f.foo")),
                equals("CombinedSelector[Element[div] > Class[Element[*].foo]]"))
    expect_that(parse_many("td.foo,.bar",
                           "td.foo, .bar",
                           "td.foo\t\r\n\f ,\t\r\n\f .bar"),
                equals(c("Class[Element[td].foo]",
                         "Class[Element[*].bar]")))
    expect_that(parse_many("div, td.foo, div.bar, span"),
                equals(c("Element[div]",
                         "Class[Element[td].foo]",
                         "CombinedSelector[Class[Element[div].bar] <followed> Element[span]]")))
    expect_that(parse_many("div > p"),
                equals("CombinedSelector[Element[div] > Element[p]]"))
    expect_that(parse_many("td:first"),
                equals("Pseudo[Element[td]:first]"))
    expect_that(parse_many("td :first"),
                equals("CombinedSelector[Element[td] <followed> Pseudo[Element[*]:first]]"))
    expect_that(parse_many(c("a[name]", "a[ name\t]")),
                equals("Attrib[Element[a][name]]"))
    expect_that(parse_many("a [name]"),
                equals("CombinedSelector[Element[a] <followed> Attrib[Element[*][name]]]"))
    expect_that(parse_many(c('a[rel="include"]', 'a[rel = include]')),
                equals("Attrib[Element[a][rel = 'include']]"))
    expect_that(parse_many("a[hreflang |= 'en']", "a[hreflang|=en]"),
                equals("Attrib[Element[a][hreflang |= 'en']]"))
    expect_that(parse_many("div:nth-child(10)"),
                equals("Function[Element[div]:nth-child(['10'])]"))
    expect_that(parse_many(":nth-child(2n+2)"),
                equals("Function[Element[*]:nth-child(['2', 'n', '+2'])]"))
    expect_that(parse_many("div:nth-of-type(10)"),
                equals("Function[Element[div]:nth-of-type(['10'])]"))
    expect_that(parse_many("div div:nth-of-type(10) .aclass"),
                equals("CombinedSelector[CombinedSelector[Element[div] <followed> Function[Element[div]:nth-of-type(['10'])]] <followed> Class[Element[*].aclass]]"))
    expect_that(parse_many("label:only"),
                equals("Pseudo[Element[label]:only]"))
    expect_that(parse_many("a:lang(fr)"),
                equals("Function[Element[a]:lang(fr)]"))
    expect_that(parse_many('div:contains("foo")'),
                equals("Function[Element[div]:contains(['foo'])]"))
    expect_that(parse_many("div#foobar"),
                equals("Hash[Element[div]#foobar]"))
    expect_that(parse_many("div:not(div.foo)"),
                equals("Negation[Element[div]:not(Class[Element[div].foo])]"))
    expect_that(parse_many("td ~ th"),
                equals("CombinedSelector[Element[td] ~ Element[th]]"))
})

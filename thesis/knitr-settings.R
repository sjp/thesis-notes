opts_chunk$set(tidy = FALSE, highlight = FALSE, comment = NA, prompt = TRUE)
#knit_theme$set("print")
library(gridSVG)
library(ggplot2)
options(prompt = "R> ", continue = "R+ ", width = 68)

jsLine <- function(line, prefix = "JS> ") {
    cat(paste0(prefix, line))
}

printNoEval <- function(text) {
    lines <- strsplit(text, "\n")[[1]]
    lines[1] <- paste0(getOption("prompt"), lines[1])
    n <- length(lines)
    if (n > 1)
        lines[2:n] <- paste0(getOption("continue"), lines[2:n])
    cat(paste0(lines, collapse = "\n"))
}

# Create a line trimming function.
# Useful in situations like SVG output where the line length
# is going to be much longer than the page width.
lineTrim <- function(line, lwd = getOption("width")) {
  library(stringr)
  line <- str_trim(line)
  if (nchar(line) > lwd)
    paste0(substring(line, 1, lwd - 3), "...")
  else
    line
}

printedLineTrim <- function(objToPrint, lwd = getOption("width")) {
    lines <- capture.output(print(objToPrint))
    paste0(sapply(lines, lineTrim, lwd), collapse = "\n")
}


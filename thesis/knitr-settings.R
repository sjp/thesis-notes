opts_chunk$set(tidy = FALSE, highlight = FALSE, comment = NA, prompt = TRUE)
#knit_theme$set("print")
library(gridSVG)
library(ggplot2)
options(prompt = "R> ", continue = "R+ ", width = 68)

jsLine <- function(line, prefix = "JS> ") {
    cat(paste0(prefix, line))
}

# Create a line trimming function.
# Useful in situations like SVG output where the line length
# is going to be much longer than the page width.
lineTrim <- function(line) {
  if (nchar(line) > 68)
    paste0(substring(line, 1, 65), "...")
  else
    line
}


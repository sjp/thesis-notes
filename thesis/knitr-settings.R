opts_chunk$set(tidy = FALSE, highlight = FALSE, comment = NA,
               prompt = TRUE, fig.align = "center", fig.pos = "H",
               fig.scap = NA, # Do not want short caption
               fig.width = 3, fig.height = 3,
               out.width = paste0(3, "in"),
               out.height = paste0(3, "in"))
knit_hooks$set(pdfcrop = hook_pdfcrop)
#knit_theme$set("print")

# setting CRAN mirror to UoA
local({
  r <- getOption("repos")
  r["CRAN"] <- "http://cran.stat.auckland.ac.nz"
  options(repos=r)
})

# Loading frequently used packages
library(gridSVG)
library(ggplot2)
# Apply local lattice fix
library(lattice, lib.loc = .libPaths()[1])

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
lineTrim <- function(line, lwd = getOption("width"), side = "both") {
  library(stringr)
  line <- str_trim(line, side = side)
  if (nchar(line) > lwd)
    paste0(substring(line, 1, lwd - 3), "...")
  else
    line
}

printedLineTrim <- function(objToPrint, lwd = getOption("width")) {
    lines <- capture.output(print(objToPrint))
    paste0(sapply(lines, lineTrim, lwd), collapse = "\n")
}

hook_phantom <- function(before, options, envir) {
    suppressPackageStartupMessages(library(gridSVG))
    if (before)
        return()

    ext <- tolower(options$fig.ext)
    if (! any(ext %in% c('pdf', 'png'))) {
        warning('this hook only exports to pdf and png at the moment')
        return()
    }

    # Generate filenames
    svg_name <- paste(fig_path("", options), ".svg", sep = "")
    out_name <- paste(fig_path("", options), ".", ext, sep = "")

    # Run gridSVG, optional arguments in gridSVG_args list if required
    if (! is.null(options$gridSVG_args)) {
        args <- formals(grid.export)
        # Set defaults
        args$name <- svg_name
        for (arg in names(gridSVG_args))
            args[[arg]] <- gridSVG_args[[arg]]
        do.call("grid.export", args)
    } else {
        grid.export(svg_name)
    }

    if (! nzchar(Sys.which('phantomjs'))) {
        warning('cannot find phantomjs; please install and put it in PATH')
        return()
    }

    message("converting ", svg_name)
    cmd <- paste("phantomjs",
                 "images/rasterize.js",
                 shQuote(svg_name),
                 shQuote(out_name),
                 paste0(options$fig.width, "*", options$fig.height))
    if (.Platform$OS.type == 'windows')
        cmd <- paste(Sys.getenv("COMSPEC"), "/c", cmd)
    system(cmd)

    # No longer need the source image
    unlink(svg_name)
}

knit_hooks$set(phantom = hook_phantom)

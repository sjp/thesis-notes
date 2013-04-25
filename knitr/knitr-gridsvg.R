# Known limitations:
#   - when upload.fun = image_uri, will fail for SVG output
#     this is because plot output is already written (usually to PNG)
#     and thus base64 encoded and inserted into the document as PNG.
#   - text output is fuzzy, seems to be a problem with inkscape
#   - when multiple plots are drawn, gridSVG will only ever render
#     the final plot
gridsvg_hook <- function(before, options, envir) {
    suppressPackageStartupMessages(library(gridSVG))
    if (before)
        return()

    ext <- tolower(options$fig.ext)
    if (! any(ext %in% c('svg', 'pdf', 'eps', 'png'))) {
        warning('this hook only exports to svg, pdf, eps, png at the moment')
        return()
    }

    # Generate filenames
    svg_name <- paste(fig_path("", options), ".svg", sep = "")
    out_name <- paste(fig_path("", options), ".", ext, sep = "")

    # Run gridSVG, optional arguments in gridSVG_args list if required
    if (! is.null(options$gridSVG_args)) {
        args <- formals(gridToSVG)
        # Set defaults
        args$name <- svg_name
        args$export.coords <- "none"
        args$export.mappings <- "none"
        args$export.js <- "none"
        args$res <- options$dpi
        for (arg in names(gridSVG_args))
            args[[arg]] <- gridSVG_args[[arg]]
        do.call("grid.export", args)
    } else {
        grid.export(svg_name, "none", "none", "none", res = options$dpi)
    }

    # If we're exporting SVG we're already done
    if (ext == "svg")
        return()
    if (! nzchar(Sys.which('inkscape'))) {
        warning('cannot find inkscape; please install and put it in PATH')
        return()
    }

    export_format <- paste("--export-", ext, "=", sep = "")
    export_dpi <- ifelse(ext %in% c("pdf", "eps"),
                         paste("--export-dpi=", options$dpi, sep = ""),
                         "")
    message("converting ", svg_name)
    cmd <- paste("inkscape",
                 "--without-gui",
                 "--export-area-page",
                 paste("--file=", shQuote(svg_name), sep = ""),
                 paste(export_format, shQuote(out_name), sep = ""),
                 export_dpi)
    if (.Platform$OS.type == 'windows')
        cmd <- paste(Sys.getenv("COMSPEC"), "/c", cmd)
    system(cmd)

    # No longer need the source image
    unlink(svg_name)
}

wkhtmltopdf_hook <- function(before, options, envir) {
    suppressPackageStartupMessages(library(gridSVG))
    if (before)
        return()

    ext <- tolower(options$fig.ext)
    if (! any(ext %in% c('svg', 'pdf', 'eps', 'png'))) {
        warning('this hook only exports to svg, pdf, eps, png at the moment')
        return()
    }

    # Generate filenames
    svg_name <- paste(fig_path("", options), ".svg", sep = "")
    out_name <- paste(fig_path("", options), ".", ext, sep = "")

    # Run gridSVG, optional arguments in gridSVG_args list if required
    if (! is.null(options$gridSVG_args)) {
        args <- formals(gridToSVG)
        # Set defaults
        args$name <- svg_name
        args$export.coords <- "none"
        args$export.mappings <- "none"
        args$export.js <- "none"
        args$res <- options$dpi
        for (arg in names(gridSVG_args))
            args[[arg]] <- gridSVG_args[[arg]]
        do.call("grid.export", args)
    } else {
        grid.export(svg_name, "none", "none", "none", res = options$dpi)
    }

    # If we're exporting SVG we're already done
    if (ext == "svg")
        return()

    message("converting ", svg_name)
    cmd <- paste("./bin/wkhtmltopdf-amd64 --use-xserver",
                 shQuote(svg_name), shQuote(out_name))
    system(cmd)
    cmd <- paste("pdfcrop", shQuote(out_name), shQuote(out_name))
    system(cmd)

    # No longer need the source image
    unlink(svg_name)
}

# For generating gridSVG content inline in HTML
# Known limitations:
#   - knitr must try *not* to generate a plot, i.e. fig.keep="none"
#   - must also use results="asis"
gridsvg_inline_hook <- function(before, options, envir) {
    suppressPackageStartupMessages(library(gridSVG))
    if (before)
        return()

    # Run gridSVG, optional arguments in gridSVG_args list if required
    if (! is.null(options$gridSVG_args)) {
        args <- formals(gridToSVG)
        # Set defaults
        args$name <- NULL
        args$export.coords <- "none"
        args$export.mappings <- "none"
        args$export.js <- "none"
        args$res <- options$dpi
        for (arg in names(gridSVG_args))
            args[[arg]] <- gridSVG_args[[arg]]
        image <- do.call("grid.export", args)$svg
    } else {
        image <- grid.export(NULL, "none", "none", "none", res = options$dpi)$svg
    }

    if (is.null(options$fig.cap))
        sprintf('<figure>%s</figure>',
                saveXML(image, file = NULL))
    else
        sprintf('<figure>%s<figcaption>%s</figcaption></figure>',
                saveXML(image, file = NULL), options$fig.cap)
}

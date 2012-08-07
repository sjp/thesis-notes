run <- function(smooth = 0.75, ...) {
    # Getting fitted Loess-smoothed values
    l.fit <- loess(ys ~ xs, span = as.numeric(smooth))
    ys.fitted <- fitted(l.fit)

    # Because we are not dealing in "native" units anymore,
    # we require some transformations
    
    # Range of the original xs is [30.55, 641.45]
    new.xs <- seq(from = 30.55, to = 641.45, length.out = 100)
    # Range of the original ys is [30.55, 641.57],
    # scale factor of 1.1 produces the full range
    y.scale.factor <- 1.1
    orig.yrange <- range(ys)
    r.to.svg.scale <- (672 / 1.1) / (orig.yrange[2] - orig.yrange[1])
    fitted.yrange <- range(ys.fitted)
    
    # Scale values plus the offset to the min value
    ys.fitted <- r.to.svg.scale * ys.fitted +
                 (abs(min(ys)) * r.to.svg.scale)

    svg.header <- '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
    svg.footer <- '</svg>'
    line.data <- paste(new.xs, ys.fitted, sep = ",", collapse = " ")

    # Generating response and sending it
    smooth.line <- paste0(svg.header,
                          '<polyline id="smoothline" points="',
                          line.data,
                          '" stroke="red" fill="none" />',
                          svg.footer)
    out(smooth.line)
    done(type = "image/svg+xml; charset=utf-8")
}





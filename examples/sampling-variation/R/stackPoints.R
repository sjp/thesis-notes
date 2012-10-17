#' Calculates y values for a vector of overlapping x values. Y values are designed to prevent overlapping by creating the appearance of stacked data. A helper function for numeric 1d Data. Also used for 2d data where one dimension is numeric, and one is categorical.
stackPoints <- function(x, levels = rep(1, length(x)), vp, y.min = 0.3,
                           y.max = unit(1, "npc")) {
    if (length(x) <= 1) y.min
    else {
        if (is.numeric(y.max))
            y.max <- unit(y.max, "npc")

        # Getting the necessary numeric unit values
        seekViewport(vp)
        y.max <- convertY(y.max, "npc", valueOnly = TRUE)
        pheight <- convertHeight(unit(1, "char"), "native",
                                 valueOnly = TRUE) * 0.8
        half.pwidth <- convertWidth(unit(1, "char"), "native",
                                    valueOnly = TRUE) * 0.5
        upViewport(0)

        stack.y <- rep(1, length(x))

        for (level in unique(levels)) {
            which.x <- which(levels == level)
            level.xs <- x[which.x]
            y.pos <- rep(1, length(level.xs))
            for (i in 1:length(which.x)) {
                in.xrange <- which(level.xs > (level.xs[i] - half.pwidth) &
                                   level.xs < (level.xs[i] + half.pwidth))
                if (length(in.xrange) <= 1) {
                    y.pos[i] <- 1L
                } else if (i == min(in.xrange)) {
                    # When this is the first time we encounter any of the
                    # values in our range leave the current value at the first level
                    y.pos[i] <- 1L
                } else {
                    xrange.ypos <- sort(unique(y.pos[in.xrange]))
                    max.stack <- tail(xrange.ypos, n = 1)
                    y.pos.seq <- seq_len(max.stack)

                    if (min(xrange.ypos) > 1)
                        ypos[i] <- 1L
                    else {
                        # We know that we need to place a point higher
                        if (length(xrange.ypos) == length(y.pos.seq)) {
                            # Place at the top of an existing stack
                            if (all(y.pos.seq == xrange.ypos))
                                y.pos[i] <- max.stack + 1
                        } else {
                            # Place where there is a gap present
                            y.pos[i] <- min(which(! y.pos.seq %in% xrange.ypos))
                        }
                    }
                }
            }
            max.stack <- max(y.pos)
            ydist <- min(diff(c(y.min, y.max)) / max.stack,
                         as.numeric(pheight))
            stack.y[which.x] <- ydist * (y.pos - 1) + y.min
        }
        stack.y
    }
}

old.stackPoints <- function(x, levels = rep(1, length(x)), vp, y.min = 0.3,
                        y.max = unit(1, "npc")) {
    if (length(x) <= 1) y.min
    else {
        if (is.numeric(y.max)) y.max <- unit(y.max, "npc")
        seekViewport(vp)
        y.max <- convertY(y.max, "npc", valueOnly = TRUE)
        pheight <- convertHeight(unit(1, "char"), "native",
                                 valueOnly = TRUE) * 0.8
        binwidth <- convertWidth(unit(1, "char"), "native",
                                 valueOnly = TRUE)
        upViewport(0)

        nbins <- ceiling(diff(range(x)) / binwidth)
        if (nbins < 1)
            nbins <- 1
        breaks <- min(x) + c(0:(nbins)) * binwidth
        group <- cut(x, breaks, include.lowest = TRUE)

        stack.y <- rep(NA, length(x))

        for (level in unique(levels)) {
            which.x <- which(levels == level)
            max.stack <- max(table(group[which.x]))
            ydist <- min(diff(c(y.min, y.max))/max.stack,
                         as.numeric(pheight))
            df <- data.frame(x = x[which.x], group = group[which.x])
            df$y <- NA
            for (i in levels(group)) {
                igroup <- which(df$group == i)
                j <- nrow(df[igroup, ])
                            if (j > 0) df[igroup, ]$y <- seq_len(j)
            }
                        stack.y[which.x] <- (df$y - 1) * ydist + y.min
        }
        stack.y
    }
}

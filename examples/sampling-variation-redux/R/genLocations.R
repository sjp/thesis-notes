# We know in advance the viewport paths for these functions.
# Does not generalise!

genSampleLocs <- function(samps) {
    xs <- matrix(numeric(nrow(samps) * ncol(samps)), ncol = ncol(samps))
    ys <- matrix(numeric(nrow(samps) * ncol(samps)), ncol = ncol(samps))
    # Open a null dev to calc stackPoints from (need vps)
    pdf(file = NULL)
    grid.newpage()
    tmpvp <- viewportCreate("wrapper::animation.field::sample.3", "sample")
    pushViewport(tmpvp)
    for (i in 1:nrow(samps)) {
        xs[i, ] <- sapply(samps[i, ], function(x) {
                          viewportConvertX("wrapper::animation.field::sample.3",
                                           x, "native")
                   })
        # Generate the *y* location for our sample points
        yys <- stackPoints(samps[i, ], vp = vpPath("sample"),
                           y.max = unit(1, "npc") - unit(0.5, "char"))
        ys[i, ] <- sapply(yys, function(x) {
                          viewportConvertY("wrapper::animation.field::sample.3",
                                           x, "npc")
                   })
    }
    dev.off()
    list(x = xs, y = ys)
}

genStatPoints <- function(stats) {
    pts <- character(length(stats))
    # Open a null dev to calc stackPoints from (need vps)
    pdf(file = NULL)
    grid.newpage()
    tmpvp <- viewportCreate("wrapper::animation.field::stat.2", "stat")
    pushViewport(tmpvp)
    yys <- stackPoints(stats, vp = vpPath("stat"), y.min = 0,
                       y.max = unit(1, "npc") - unit(0.5, "char"))
    pg <- pointsGrob(x = stats, y = yys, vp = "stat",
                     gp = gpar(col = "grey60", lwd = 2, alpha = 0.7), pch = 1,
                     name = "stat-points")
    grid.draw(pg)
    # If we just want the xs and ys use the following code
    #for (i in 1:length(stats)) {
    #    pts[i] <- paste(viewportConvertX("wrapper::animation.field::stat.2",
    #                                     stats[i], "native"),
    #                    viewportConvertY("wrapper::animation.field::stat.2",
    #                                     yys[i], "npc"),
    #                    sep = ",")
    #}
    svgdoc <- gridToSVG("", "none", "none", res = 96)$svg
    pts <- querySelectorNS(svgdoc, "#stat-points",
                           c(svg = "http://www.w3.org/2000/svg"))
    dev.off()
    saveXML(pts, file = NULL, indent = FALSE)
}

genSampleStatData <- function(stats) {
    lineXs <- viewportConvertX("wrapper::animation.field::sample.3",
                               stats, "native")
    ghostLineYs <- viewportConvertY("wrapper::animation.field::sample.3",
                                    c(0.15, 0.35), "npc")
    lineYs <- viewportConvertY("wrapper::animation.field::sample.3",
                               c(0.05, 0.5), "npc")
    ghostLinePoints <- paste(lineXs, ghostLineYs, sep = ",", collapse = " ")
    sampleLinePoints <- paste(lineXs, lineYs, sep = ",", collapse = " ")
    
    # Now that we have the points, we want a template to apply these points to
    pdf(file = NULL)
    grid.newpage()
    tmpvp <- viewportCreate("wrapper::animation.field::sample.3", "sample")
    pushViewport(tmpvp)
    # Set to be 0,0 point locations because we won't be using the locations
    # anyway as they will be replaced
    grid.lines(x = unit(rep(0, 2), "npc"),
               y = unit(rep(0, 2), "npc"),
               gp = gpar(alpha = 0.25, col = "blue", lwd = 2),
               name = "samplePlot-ghosts")
    grid.lines(x = unit(rep(0, 2), "npc"),
               y = unit(rep(0, 2), "npc"),
               gp = gpar(lwd = 4, col = "blue"),
               name = "samplePlot-lines")
    svgdoc <- gridToSVG(NULL, "none", "none", res = 96)$svg
    ghostsTpl <- querySelectorNS(svgdoc, "#samplePlot-ghosts",
                                 c(svg = "http://www.w3.org/2000/svg"))
    lineTpl <- querySelectorNS(svgdoc, "#samplePlot-lines",
                               c(svg = "http://www.w3.org/2000/svg"))
    dev.off()

    svg.header <- '<svg xmlns="http://www.w3.org/2000/svg">'
    svg.footer <- '</svg>'

    ghostsTpl <- paste0(svg.header, saveXML(ghostsTpl, file = NULL, indent = FALSE), svg.footer)
    lineTpl <- paste0(svg.header, saveXML(lineTpl, file = NULL, indent = FALSE), svg.footer)

    list(lineXs = lineXs, ghostLineYs = ghostLineYs, lineYs = lineYs,
         ghostsTpl = ghostsTpl, lineTpl = lineTpl)
}

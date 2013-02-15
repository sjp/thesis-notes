# x is the population
createAxes <- function(x) {
    data.xag <- xaxisGrob(vp = getPath("data"), name = "data-xaxis")
    sample.xag <- xaxisGrob(vp = getPath("sample"), name = "sample-xaxis")
    stat.xag <- xaxisGrob(vp = getPath("stat"), name = "stat-xaxis")
    gList(data.xag, sample.xag, stat.xag)
}

# x is population
plotData <- function(x, gt) {
    gt <- addGrob(gt,
                  linesGrob(x = c(mean(x), mean(x)), y = c(0, 3),
                            default.units = "native",
                            gp = gpar(col = "grey60", lty = "dashed"),
                            vp = getPath("animation.field"),
                            name = "v-data-stat"))
    y <-  stackPoints(x, vp = getPath("data"),
                      y.max = unit(1, "npc") - unit(0.5, "char"))
    pg <- pointsGrob(x = x, y = y, vp = getPath("data"),
                     gp = gpar(col = "grey60", lwd = 2), pch = 1,
                     name = "data-points")
    gt <- addGrob(gt, pg)
    gt
}

# x is sample
plotSample <- function(x, ind, gt) {
    y <-  stackPoints(x, vp = getPath("sample"),
                      y.max = unit(1, "npc") - unit(0.5, "char"))
    pg <- pointsGrob(x = x, y = y, vp = getPath("sample"),
                     gp = gpar(col = "black", lwd = 2), pch = 19,
                     name = paste("sample-points", ind, sep = "-"))
    gt <- addGrob(gt, pg)
    gt
}

plotAllSamples <- function(x, gt) {
    for (i in 1:nrow(x))
        gt <- plotSample(x, i, gt)
    gt
}

# x is stats generated from every sample
plotStat <- function(x, gt) {
    y <-  stackPoints(x, vp = getPath("stat"), y.min = 0,
                      y.max = unit(1, "npc") - unit(0.5, "char"))
    pg <- pointsGrob(x = x, y = y, vp = getPath("stat"),
                     gp = gpar(col = "grey60", lwd = 2, alpha = 0.7), pch = 1,
                     name = "stat-points")
    gt <- addGrob(gt, pg)
    gt
}

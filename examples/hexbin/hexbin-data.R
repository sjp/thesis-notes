library(hexbin)
library(gridSVG)
library(selectr)

xs <- rnorm(10000)
ys <- rnorm(10000)
h <- hexbin(xs, ys)

pdf(file = NULL)
plot(h)
hexbincol <- gridToSVG(NULL, "none", "none")$svg
dev.off()

pdf(file = NULL)
plot(h, style="centroids")
hexbinarea <- gridToSVG(NULL, "none", "none")$svg
dev.off()

# Let's first grab the legends
colLegend <- querySelectorNS(hexbincol, "svg|g[id^='GRID\\.VP']",
                             c(svg = "http://www.w3.org/2000/svg"))
areaLegend <- querySelectorNS(hexbinarea, "svg|g[id^='GRID\\.VP']",
                              c(svg = "http://www.w3.org/2000/svg"))

# Because we want to transition colours and areas,
# we need to collect all relevant colours and 'points'
# for each of the hexagons.

# Collecting hexagons
colPolygons <- querySelectorAllNS(hexbincol, 'svg|g[clip-path] svg|polygon',
                                  c(svg = "http://www.w3.org/2000/svg"))
areaPolygons <- querySelectorAllNS(hexbinarea, "svg|g[clip-path] svg|polygon",
                                   c(svg = "http://www.w3.org/2000/svg"))

# Note that stroke == fill so we only need to do this once
colFills <- sapply(colPolygons, function(x) xmlGetAttr(x, "fill"))
areaFills <- sapply(areaPolygons, function(x) xmlGetAttr(x, "fill"))

# Now we need to get all of the points so we know the positions and
# dimensions of each of our hexagons
colPoints <- sapply(colPolygons, function(x) xmlGetAttr(x, "points"))
areaPoints <- sapply(areaPolygons, function(x) xmlGetAttr(x, "points"))

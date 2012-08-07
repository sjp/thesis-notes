library(Rook)

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

# The SVG in the smoothed image is generated from the following data
# xs <- seq(from = -10, to = 10, length.out = 100)
# ys <- xs^2 + 15 * rnorm(100)
# To preserve the results of this, they were stored in a data file
load(file = "smoothData.RData")

ws$add(name = "svgtest",
       app = Builder$new(
                 Static$new(urls = c('/smooth-ex.html', '/css','/images','/javascript'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/smooth-ex.html")))

ws$browse("svgtest")

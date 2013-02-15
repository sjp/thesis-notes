library(Rook)
library(gridSVG)
library(hexbin)
library(selectr)

# This takes a while...
cat("Please wait while this example loads...\n")
source("hexbin-data.R")

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "hexbin",
       app = Builder$new(
                 Static$new(urls = c('/index.html', '/js', '/css'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/brew/index.html")))

cat("\n--------------------------")
cat("\n\nTo run this example, visit the following URL:\n")
cat(ws$full_url("hexbin"), "\n\n")
cat('Alternatively run the following command:\nws$browse("hexbin")\n\n')

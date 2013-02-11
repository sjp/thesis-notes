library(Rook)
library(gridSVG)
library(hexbin)
library(selectr)

# This takes a while...
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

print(ws)



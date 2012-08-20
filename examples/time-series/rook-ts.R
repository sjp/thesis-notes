library(Rook)

source("acf-plots.R")

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "arma",
       app = Builder$new(
                 Static$new(urls = '/arma.html',
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/arma.html")))

ws$browse("arma")

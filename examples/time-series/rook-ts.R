library(RJSONIO)
library(Rook)

source("acf-plots.R")

coordsInfoGen <- function() { 
    coords <- NULL
    function(newCoords = NULL) { 
        if (is.null(newCoords)) { 
            coords 
        } else { 
            coords <<- newCoords 
        }
    } 
}
coordsInfo <- coordsInfoGen()

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "arma",
       app = Builder$new(
                 Static$new(urls = c('/arma.html', '/coords.js'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/arma.html")))

ws$browse("arma")

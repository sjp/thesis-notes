library(RJSONIO)
library(Rook)

source("acf-plots.R")

armaDatasetGen <- function() {
    dataset <- Nile
    function(newdata = NULL) {
        if (is.null(newdata)) {
            dataset
        } else {
            newts <- ts(newdata, start = c(1998, 9), frequency = 12)
            dataset <<- newts
        }
    }
}
armaDataset <- armaDatasetGen()

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

library(gridSVG)
library(Rook)

source("R/stackPoints.R")
source("R/buildViewports.R")
source("R/sectionPlots.R")
source("R/main.R")
source("R/genLocations.R")

datasetGen <- function() {
    dataset <- mtcars$mpg
    function(newdata = NULL) {
        if (is.null(newdata)) {
            dataset
        } else {
            dataset <<- newdata
        }
    }
}
dataset <- datasetGen()

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "sampvar",
       app = Builder$new(
                 Static$new(urls = c('/sampvar.html', '/js', '/coords.js'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/sampvar.html")))

print(ws)

dataset(read.csv("data.csv")[[1]])
#firstSVG(dataset())

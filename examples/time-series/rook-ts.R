library(gridSVG)
library(Rook)

# fully qualified name because XML package masks 'source'
# and gives us a whole bunch of warnings
base::source("acf-plots.R")

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

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "arma",
       app = Builder$new(
                 Static$new(urls = c('/arma.html', '/coords.js'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/arma.html")))

print(ws)

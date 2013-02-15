# Loading required packages, quietly
library(gridSVG)
library(selectr)
library(Rook)

# Loading in main ACF/PACF plotting function
source("R/acf-plots.R")

# Set 'Nile' to be the default dataset, but allow changing
armaDatasetGen <- function() {
    dataset <- Nile
    function(newdata = NULL) {
        if (is.null(newdata)) {
            dataset
        } else {
            newts <- ts(newdata)
            dataset <<- newts
        }
    }
}
armaDataset <- armaDatasetGen()

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "arma",
       app = Builder$new(
                 Static$new(urls = c('/css', '/js'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/brew/index.html")))

cat("\n--------------------------")
cat("\n\nTo run this example, visit the following URL:\n")
cat(ws$full_url("arma"), "\n\n")
cat('Alternatively run the following command:\nws$browse("arma")\n\n')


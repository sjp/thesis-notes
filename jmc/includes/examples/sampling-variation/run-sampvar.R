# Load required packages
library(gridSVG)
library(Rook)
library(animaker)
library(selectr)

# Load required utility functions for building up the plot
source("R/stackPoints.R")
source("R/buildViewports.R")
source("R/sectionPlots.R")
source("R/main.R")
source("R/genLocations.R")

# We can refer to the dataset using this closure (and also assign)
datasetGen <- function() {
    # Use mtcars if no data found
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
# Let's use a provided dataset
dataset(read.csv("datasets/data.csv")[[1]])

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "sampvar",
       app = Builder$new(
                 Static$new(urls = c('/js', '/css'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/brew/index.html")))

cat("\n--------------------------")
cat("\n\nTo run this example, visit the following URL:\n")
cat(ws$full_url("sampvar"), "\n\n")
cat('Alternatively run the following command:\nws$browse("sampvar")\n\n')

library(gridSVG)
library(selectr)
library(Rook)

# This takes a while...
cat("Please wait while this example loads...\n")
source("finiteMixture.R")

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "finite-mm",
       app = Builder$new(
                 Static$new(urls = c('/index.html', '/js', '/css'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/brew/index.html")))

cat("\n--------------------------")
cat("\n\nTo run this example, visit the following URL:\n")
cat(ws$full_url("finite-mm"), "\n\n")
cat('Alternatively run the following command:\nws$browse("finite-mm")\n\n')

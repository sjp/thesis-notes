library(Rook)
library(gridSVG)

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "mds",
       app = Builder$new(
                 Static$new(urls = c('/index.html', '/js', '/css'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/brew/index.html")))

cat("\n--------------------------")
cat("\n\nTo run this example, visit the following URL:\n")
cat(ws$full_url("mds"), "\n\n")
cat('Alternatively run the following command:\nws$browse("mds")\n\n')

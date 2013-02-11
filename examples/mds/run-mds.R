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

print(ws)



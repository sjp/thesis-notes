library(Rook)

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "svgtest",
       app = Builder$new(
                 Static$new(urls = c('/svgtest.html', '/css','/images','/javascript'),
                            root = '.'),
                 Brewery$new(url = '/brew',
                             root = '.'),
                 Redirect$new("/svgtest.html")))

ws$browse("svgtest")

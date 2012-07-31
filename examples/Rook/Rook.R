library(Rook)

ws <- Rhttpd$new()
ws$start(quiet = TRUE)

ws$add(name = "svgtest",
       app = Builder$new(Static$new("/svgtest.html", "."),
                         Redirect$new("/svgtest.html")))

ws$add(name = "circle",
       app = function(env) {
           req <- Request$new(env)
           res <- Response$new()
           cx.get <- req$GET()$cx
           cx <- if (! is.null(cx.get)) as.numeric(cx.get) else 50
           svg.doc <- paste0('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">',
                             '<circle cx="',
                             cx + 30,
                             '" cy="50" r="50" id="svgcirc" fill="red" onclick="updatePos();" />',
                             '</svg>')
           res$header("Content-Type", "text/xml")
           res$write(svg.doc)
           res$finish()
       })

ws$browse("svgtest")

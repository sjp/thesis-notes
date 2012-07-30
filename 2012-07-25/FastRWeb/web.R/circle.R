run <- function(cx = 10, ...) {
    newsize = as.integer(cx) + 30
    circ.doc = paste0('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">',
                      '<circle cx="',
                      newsize,
                      '" cy="50" r="50" id="svgcirc" fill="red" onclick="updatePos();" />',
                      '</svg>')
    out(circ.doc)
    done()
}





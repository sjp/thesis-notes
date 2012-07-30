run <- function(cx = 10, ...) {
    newsize = as.integer(cx) + 30
    circ.code = paste("var e = document.createElementNS(\"http://www.w3.org/2000/svg\", \"circle\");",
                      "e.setAttribute(\"id\", \"svgcirc\");",
                      paste0("e.setAttribute(\"cx\", ", newsize, ");"),
                      "e.setAttribute(\"cy\", \"50\");",
                      "e.setAttribute(\"r\", \"50\");",
                      "e.setAttribute(\"fill\", \"red\");",
                      "e.setAttribute(\"onclick\", \"updatePos();\");", sep = "\n")
    out(circ.code)
    done()
}





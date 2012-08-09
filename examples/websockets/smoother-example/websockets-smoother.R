# Simple example
library(websockets)
library(XML)
PORT <- 9999L
w <- create_server(port = PORT, webpage = static_file_service("smoother-ex.html"))

# Loading in original data for smoother
load("smoothData.RData", envir = .GlobalEnv)

f <- function(DATA, WS, ...)
{
  D <- ""
  if (is.raw(DATA))
      D <- eval(parse(text=rawToChar(DATA)))
  # Assume D is a numeric value
  smooth <- as.numeric(D)

  # Getting fitted Loess-smoothed values
  l.fit <- loess(ys ~ xs, span = smooth)
  ys.fitted <- fitted(l.fit)

  # Because we are not dealing in "native" units anymore,
  # we require some transformations
  
  # Range of the line xs is [88.57, 625.89]
  new.xs <- seq(from = 88.57, to = 625.89, length.out = 100)

  # Range of original ys = [-32.86, 132.09]
  # Range of line ys = [77.13, 625.46]
  # Scale for R -> SVG is 3.324x
  scale.factor <- 3.324
  # The offset is the point at which y = 0
  ys.offset <- 77.13 + abs(min(ys)) * scale.factor
  ys.fitted <- (scale.factor * ys.fitted) + ys.offset

  svg.el <- newXMLNode("svg", namespaceDefinitions = "http://www.w3.org/2000/svg",
                       attrs = list(width = "300", height = "300"))
  line.data <- paste(new.xs, ys.fitted, sep = ",", collapse = " ")
  line.el <- newXMLNode("polyline",
                        parent = svg.el,
                        attrs = list(id = "smoothline",
                                     points = line.data,
                                     stroke = "red",
                                     fill = "none"))

  # Get a string representation *without* indentation.
  # This makes using DOM methods easier because we don't
  # need to worry about text nodes in the DOM. Also has
  # the benefit of reducing the amount of data sent over
  # the wire.
  svg.output <- saveXML(svg.el, indent = FALSE)

  websocket_write(DATA=svg.output,WS=WS)
}
set_callback('receive',f,w)
cl <- function(WS)
{
  cat("Websocket client socket ",WS$socket," has closed.\n")
}
set_callback('closed',cl,w)
es <- function(WS)
{
  cat("Websocket client socket ",WS$socket," has been established.\n")
}
set_callback('established',es,w)

cat(paste0("Direct your web browser to http://localhost:", PORT, "\n"))

daemonize(w)

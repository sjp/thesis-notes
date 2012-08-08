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
  
  # Range of the original xs is [30.55, 641.45]
  new.xs <- seq(from = 30.55, to = 641.45, length.out = 100)
  # Range of the original ys is [30.55, 641.57],
  # scale factor of 1.1 produces the full range
  y.scale.factor <- 1.1
  orig.yrange <- range(ys)
  r.to.svg.scale <- (672 / 1.1) / (orig.yrange[2] - orig.yrange[1])
  fitted.yrange <- range(ys.fitted)
  
  # Scale values plus the offset to the min value
  ys.fitted <- r.to.svg.scale * ys.fitted +
               (abs(min(ys)) * r.to.svg.scale)

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

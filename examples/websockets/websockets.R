# Simple example
library(websockets)
PORT <- 9999L
w <- create_server(port = PORT, webpage = static_file_service("example.html"))

f <- function(DATA, WS, ...)
{
  D <- ""
  if (is.raw(DATA))
      D <- eval(parse(text=rawToChar(DATA)))
  # Assume D is a numeric value
  D <- as.numeric(D) + 30 # Shift 30px to the right
  svg.example <- paste0('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">',
                        '<circle cx="',
                        D,
                        '" cy="50" r="50" id="svgcirc" fill="red" onclick="updatePos();" />',
                        '</svg>')
  websocket_write(DATA=svg.example,WS=WS)
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

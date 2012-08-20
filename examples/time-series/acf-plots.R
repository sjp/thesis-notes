library(grid)
library(gridSVG)

plotAcfs <- function(df = Nile, p = 0, q = 0, lag.max = 48) {
  fitArima <- arima(df, order = c(p, 0, q))
  fitAcf <- acf(residuals(fitArima), lag.max = lag.max, plot = FALSE)
  fitPacf <- pacf(residuals(fitArima), lag.max = lag.max, plot = FALSE)
  ci <- 0.95
  clim <- qnorm((1 + ci)/2)/sqrt(fitAcf$n.used)

  dev.new()
  on.exit(dev.off())
  grid.newpage()
  acfvp <- viewport(x = 0, y = 0.5, height = 0.5,
                    just = c("left", "bottom"), name = "acfvp")
  pacfvp <- viewport(x = 0, y = 0, height = 0.5,
                     just = c("left", "bottom"), name = "pacfvp")
  acfwindowvp <- viewport(width = 0.8, height = 0.8,
                          xscale = c(-1, lag.max + 1), yscale = extendrange(c(-0.2, 1)),
                          name = "acfwindowvp")
  pacfwindowvp <- viewport(width = 0.8, height = 0.8,
                           xscale = c(0, lag.max + 1), yscale = extendrange(c(-0.2, 1)),
                           name = "pacfwindowvp")

  drawCf <- function(heights, type = c("acf", "pacf"), clim = NULL) {
    type <- match.arg(type)
    
    if (type == "acf") {
      pushViewport(acfvp)
      pushViewport(acfwindowvp)
    }
    if (type == "pacf") {
      pushViewport(pacfvp)
      pushViewport(pacfwindowvp)
    }
    grid.xaxis(name = "xaxis")
    grid.yaxis(name = "yaxis")
    grid.rect(name = "box")
    grid.lines(y = unit(c(0, 0), "native"), name = "zeroline")
    grid.polyline(x = unit(rep(c(0, 1), 2), "npc"),
                  y = unit(rep(c(clim, -clim), each = 2), "native"),
                  id.lengths = rep(2, 2), gp = gpar(col = "blue", lty = "dashed"),
                  name = paste0(type, "clims"))
    grid.polyline(x = unit(rep(1:length(heights) / (length(heights) + 1), 2), "npc"),
                  y = unit(c(rep(0, length(heights)), heights), "native"),
                  id = rep(1:length(heights), 2),
                  name = paste0(type, "heights"))
    popViewport() # leaving window
    popViewport() # going to root
  }
  drawCf(fitAcf$acf, type = "acf", clim = clim)
  drawCf(fitPacf$acf, type = "pacf", clim = clim)
  gridToSVG("acf-demo.svg")
}

#plotAcfs()

acfSVG <- function(p, q) {
  heights <- acf(residuals(arima(Nile, order = c(p, 0, q))),
                 plot = FALSE, lag.max = 48)$acf
  svg.header <- '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
  svg.footer <- '</svg>'
  xs <- 1:length(heights) / (length(heights) + 1) 
  xs <- c(rbind(xs, xs))
  xs <- viewportConvertX("acfwindowvp", xs, "npc")
  ys <- c(rbind(rep(0, length(heights)), heights))
  ys <- viewportConvertY("acfwindowvp", ys, "native")
  points <- paste(xs, ys, sep = ",")

  line.pairs <- character(length(points) / 2)
  for (i in 1:(length(points) / 2)) {
    line.pairs[i] <- paste0(points[2 * i - 1], " ", points[2 * i])
  }

  paste0(c(svg.header,
           paste0('<polyline points="', line.pairs, '" />'),
           svg.footer), collapse = "")
}

pacfSVG <- function(p, q) {
  heights <- pacf(residuals(arima(Nile, order = c(p, 0, q))),
                  plot = FALSE, lag.max = 48)$acf
  svg.header <- '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
  svg.footer <- '</svg>'
  xs <- 1:length(heights) / (length(heights) + 1) 
  xs <- c(rbind(xs, xs))
  xs <- viewportConvertX("pacfwindowvp", xs, "npc")
  ys <- c(rbind(rep(0, length(heights)), heights))
  ys <- viewportConvertY("pacfwindowvp", ys, "native")
  points <- paste(xs, ys, sep = ",")

  line.pairs <- character(length(points) / 2)
  for (i in 1:(length(points) / 2)) {
    line.pairs[i] <- paste0(points[2 * i - 1], " ", points[2 * i])
  }

  paste0(c(svg.header,
           paste0('<polyline points="', line.pairs, '" />'),
           svg.footer), collapse = "")
}

library(RJSONIO)
gridSVGCoords <- fromJSON("acf-demo.json")

viewportConvertX <- function(vpname, x, from) {
  offset <- gridSVGCoords[[vpname]]$x
  width <- viewportConvertWidth(vpname, x, from, "svg")
  offset + width
}

viewportConvertY <- function(vpname, x, from) {
  offset <- gridSVGCoords[[vpname]]$y
  height <- viewportConvertHeight(vpname, x, from, "svg")
  offset + height
}

viewportConvertWidth <- function(vpname, x, from, to) {
  vpCoords <- gridSVGCoords[[vpname]]
  i <- toInches(from, x,
                vpCoords$width,
                vpCoords$xscale,
                vpCoords$inch)
  u <- toUnit(to, i,
              vpCoords$width,
              vpCoords$xscale,
              vpCoords$inch)
  round(u, 2)
}

viewportConvertHeight <- function(vpname, x, from, to) {
  vpCoords <- gridSVGCoords[[vpname]]
  i <- toInches(from, x,
                vpCoords$height,
                vpCoords$yscale,
                vpCoords$inch)
  u <- toUnit(to, i,
              vpCoords$height,
              vpCoords$yscale,
              vpCoords$inch)
  round(u, 2)
}

toInches <- function(from, unitValue, vpDimSize, nativeScale, dimInchSize) {
  if (from == "inches")
    return(unitValue)

  nativeToInches <- function(nativeValue, nativeScale, vpDimSize, dimInchSize) {
    dist <- nativeValue - nativeScale[1]
    nativeUnitSize <- vpDimSize / abs(nativeScale[2] - nativeScale[1])
    dist * nativeUnitSize / dimInchSize
  }
  
  npcToInches <- function(npcValue, vpDimSize, dimInchSize) {
    (npcValue * vpDimSize) / dimInchSize
  }

  if (from == "native") {
    result <- nativeToInches(unitValue, nativeScale, vpDimSize, dimInchSize)
  } else if (from == "npc") {
     result <- npcToInches(unitValue, vpDimSize, dimInchSize)
  } else if (from == "svg") {
     result <- unitValue / dimInchSize
  } else {
    result <- convertUnit(unit(unitValue, from), "inches", valueOnly = TRUE)
  }

  result
}

toUnit <- function(to, unitValue, vpDimSize, nativeScale, dimInchSize) {
  if (to == "inches")
    return(unitValue)

  inchesToNative <- function(inchesValue, nativeScale, vpDimSize, dimInchSize) {
    npc <- (inchesValue * dimInchSize) / vpDimSize
    vpRange <- nativeScale[2] - nativeScale[1]
    (npc * vpRange) + nativeScale[1]
  }
  
  inchesToNpc <- function(inchesValue, vpDimSize, dimInchSize) {
    (inchesValue * dimInchSize) / vpDimSize
  }

  if (to == "native") {
    result <- inchesToNative(unitValue, nativeScale, vpDimSize, dimInchSize)
  } else if (to == "npc") {
    result <- inchesToNpc(unitValue, vpDimSize, dimInchSize)
  } else if (to == "svg") {
    result <- unitValue * dimInchSize
  } else {
    result <- convertUnit(unit(unitValue, "inches"), to, valueOnly = TRUE)
  }

  result
}

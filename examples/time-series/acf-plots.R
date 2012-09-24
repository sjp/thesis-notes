plotAcfs <- function(df = Nile, p = 0, q = 0, lag.max = 48) {
  fitArima <- arima(df, order = c(p, 0, q))
  fitAcf <- acf(residuals(fitArima), lag.max = lag.max, plot = FALSE)
  fitPacf <- pacf(residuals(fitArima), lag.max = lag.max, plot = FALSE)
  ci <- 0.95
  clim <- qnorm((1 + ci)/2)/sqrt(fitAcf$n.used)

  acfRangeY <- extendrange(range(c(fitAcf$acf, clim, -clim)))
  pacfRangeY <- extendrange(range(c(fitPacf$acf, clim, -clim)))

  pdf(file = NULL)
  on.exit(dev.off())
  grid.newpage()
  acfvp <- viewport(x = 0, y = 0.5, height = 0.5,
                    just = c("left", "bottom"), name = "acfvp")
  pacfvp <- viewport(x = 0, y = 0, height = 0.5,
                     just = c("left", "bottom"), name = "pacfvp")
  acfwindowvp <- viewport(width = 0.8, height = 0.8,
                          xscale = c(-1, lag.max + 1), yscale = acfRangeY,
                          name = "acfwindowvp")
  pacfwindowvp <- viewport(width = 0.8, height = 0.8,
                           xscale = c(0, lag.max + 1), yscale = pacfRangeY,
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
    grid.xaxis(name = paste0(type, "xaxis"))
    grid.yaxis(name = paste0(type, "yaxis"))
    grid.rect(name = paste0(type, "box"))
    grid.lines(y = unit(c(0, 0), "native"), name = paste0(type, "zeroline"))
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
  gridToSVG("", "none", "none", res = 96)
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

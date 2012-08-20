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

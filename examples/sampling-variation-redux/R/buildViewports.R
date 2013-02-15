# Constructs a viewport tree for us
buildViewports <- function(x) {
    xscale <- range(x)
    yscale <- 0:1
    main.layout <- grid.layout(nrow = 3)
    animation.field <- dataViewport(xscale = xscale, yscale = c(0, 3),
                                    layout = main.layout,
                                    name = "animation.field")
    data <- dataViewport(xscale = xscale, yscale = yscale,
                         layout.pos.row = 1,
                         name = "data")
    sample <- dataViewport(xscale = xscale, yscale = yscale,
                           layout.pos.row = 2,
                           name = "sample")
    stat <- dataViewport(xscale = xscale, yscale = yscale,
                         layout.pos.row = 3,
                         name = "stat")

    wrapper <- plotViewport(c(3, 1, 0, 1), name = "wrapper")

    vpTree(wrapper, vpList(vpTree(animation.field, vpList(data, sample, stat))))
}

# Convenience function to generate vpPaths for us
getPath <- function(x) {
    if (x == "animation.field")
        vpPath("wrapper", x)
    else
        vpPath("wrapper", "animation.field", x)
}

library(shiny)
library(selectr)
library(ggplot2)
library(gridSVG)

# Create randomly generated data
xs <- seq(-10, 10, length.out = 100)
ys <- xs^2 + 15 * rnorm(100)

# Create a ggplot2 plot that will be treated as a constant
svgplot <- {
    pdf(file = NULL)                               
    print(qplot(xs, ys))
    svgplot <- gridToSVG(NULL, "none", "none")
    dev.off()
    gridSVGCoords(svgplot$coords)
    saveXML(svgplot$svg, file = NULL)
}

# Find the viewport that the data belongs in.
# This is useful because we want to insert our smoother within it.
# Also, we need to recreate this viewport so we need it's name
panelvp <- grep("^layout::panel.*", names(gridSVGCoords()), value = TRUE)

shinyServer(function(input, output) {
    spanPar <- reactive({ as.numeric(input$spanalpha) })

    # Generate loess smoother lines based on the span parameter
    loessLine <- reactive({
        # Opening a null device with a new page
        pdf(file = NULL)
        grid.newpage()
        # Create a new viewport that is located at the same
        # position and has the same size as the original vp
        newvp <- viewportCreate(panelvp, newname = "newvp")
        # Original vp does not have scales, introduce them
        newvp$xscale <- extendrange(xs)
        newvp$yscale <- extendrange(ys)
        pushViewport(newvp)
        # Creating the smoother
        ll <- loess(ys ~ xs, span = spanPar())
        # Creating a line based on the smoother
        grid.lines(x = xs, y = fitted(ll), default.units = "native",
                   gp = gpar(col = "red"), name = "smoother")
        # Creating SVG output and reducing to only the smoother line
        tmp <- gridToSVG(NULL, "none", "none")$svg
        dev.off()
        loesssvg <- querySelectorNS(tmp, "#smoother",
                                    c(svg = "http://www.w3.org/2000/svg"))
        # Export XML node to text
        # Wrap in SVG for easy parsing with DOMParser
        paste('<svg xmlns="http://www.w3.org/2000/svg">', saveXML(loesssvg, file = NULL, indent = FALSE), "</svg>", sep = "")
    })

    output$smoothempty <- renderText({ loessLine() })

    output$svggrid <- renderText({ svgplot })
})

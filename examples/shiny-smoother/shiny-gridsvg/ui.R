library(shiny)

# Just create an empty div for our content, we won't actually be drawing
# anything, just modifying an existing plot.
# As a result we're actually more interested in the "svggrid" output.
reactiveFiller <- function (outputId) {
    HTML(paste('<div id="', outputId, '"></div>', sep = ""))
}

shinyUI(pageWithSidebar(
    headerPanel("Smoother Example"),

    sidebarPanel(
        # Span parameter for loess
        sliderInput("spanalpha", "Span:", 
                    min = 0.05, max = 1, value = 0.75, step = 0.05)
    ),

    mainPanel(
        htmlOutput("svggrid"),
        # See reactiveFiller() above
        reactiveFiller("smoothempty"),
        includeHTML("smoother.html")
    )
))

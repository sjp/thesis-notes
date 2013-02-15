library(shiny)

shinyUI(pageWithSidebar(
    headerPanel("Smoother Example"),

    sidebarPanel(
        # Span parameter for loess
        sliderInput("spanalpha", "Span:", 
                    min = 0.05, max = 1, value = 0.75, step = 0.05)
    ),

    mainPanel(
        plotOutput("mainplot")
    )
))

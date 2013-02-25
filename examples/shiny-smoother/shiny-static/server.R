library(shiny)
library(ggplot2)

# Create randomly generated data
xs <- seq(-10, 10, length.out = 100)
ys <- xs^2 + 15 * rnorm(100)

shinyServer(function(input, output) {
    output$mainplot <- renderPlot({
        print(
            qplot(xs, ys) +
            stat_smooth(method = "loess",
                        mapping = aes(colour = "red"),
                        se = FALSE,
                        span = input$spanalpha) +
            theme(legend.position = "none")
        )
    }, width = 504, height = 504)
})

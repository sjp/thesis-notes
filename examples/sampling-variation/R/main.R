# Use this to generate the first image
firstSVG <- function(x) {
    # Generated data is from the following distribution
    #mydat <- rnorm(100, mean = 120, sd = 20)
    pdf(file = NULL)
    pushViewport(buildViewports(x))
    axes <- createAxes(x)
    mainImage <- gTree(name = "image", children = axes,
                       childrenvp = buildViewports(x))
    mainImage <- plotData(x, mainImage)
    grid.newpage()
    grid.draw(mainImage)
    gridToSVG("init.svg", res = 96)
    dev.off()
}

genNewSamples <- function(x, n = 30, n.samples = 100) {
    dataSize <- length(x)
    indexMatrix <- matrix(integer(n * n.samples), ncol = n, nrow = n.samples)
    # We sort so that stackPoints is made easier
    for (i in 1:n.samples)
       indexMatrix[i, ] <- sort(sample(dataSize, n))
    indexMatrix
}

sampleFromPop <- function(x.pop, x.samples) {
    n <- nrow(x.samples)
    n.obs <- ncol(x.samples) * n
    selected.sample <- matrix(numeric(n.obs), nrow = n) 
    for (i in 1:n)
        selected.sample[i, ] <- x.pop[x.samples[i, ]]
    selected.sample
}

# Returns a vector of statistics for us to use
genNewStats <- function(samples, FUN = mean) {
    rowMeans(samples)
}


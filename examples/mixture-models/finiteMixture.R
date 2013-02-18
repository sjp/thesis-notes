# Originally authored by Jared Tobin at: https://github.com/jtobin/gibbs-mm-applets

################################################################################
# Finite Gaussian mixture model
################################################################################

# initial setup
library(MASS)
library(car)
library(mvtnorm)
library(bayesm)

# number of clusters (can be automated in the case of a Dirichlet process mixture)
K = 3

plotter = function(x, z) {
    palette = c('red', 'blue', 'green')
    # x/y-scale stays constant, convenient for our uses
    pdf(file = NULL)
    pvp <- plotViewport(
        xscale = extendrange(c(min(x[,1]) - 3, max(x[,1]) + 3)),
        yscale = extendrange(c(min(x[,2]) - 8, max(x[,2]) + 8)),
        name = "mainvp"
    )
    grid.newpage()
    pushViewport(pvp)
    grid.rect(name = "border")
    grid.xaxis(name = "xaxis")
    grid.yaxis(name = "yaxis")
    grid.points(x = x[,1], y = x[,2],
                gp = gpar(col = if (missing(z)) "black" else palette[z]),
                pch = 16, name = "main-pts")
}

################################################################################
# Model:
# pi   | alpha0            ~ symmetricDirichlet(alpha0/K)
# z    | pi                ~ multinomial(pi)
# x    | phi               ~ gaussian(phi)
# phiv | nu0, Lambda0      ~ inverseWishart(nu0, Lambda0^-1)
# phi  | phiv, kappa0, mu0 ~ normal(mu0, phiv/kappa0)
################################################################################

# generate mvn variates
mu = matrix(data = c(-5, -5, 3, -6, 5, 4.5), byrow = T, nrow = 3, ncol = 2)
Sigma = diag(1, ncol(mu))

x1 = mvrnorm(50, mu = mu[1,], Sigma = Sigma)
x2 = mvrnorm(50, mu = mu[2,], Sigma = Sigma)
x3 = mvrnorm(50, mu = mu[3,], Sigma = Sigma)
x  = rbind(x1, x2, x3)

# plot initial unlabelled data
plotter(x = x)
firstPlot <- gridToSVG(NULL, "none", "none")
dev.off()
# Wiping out any existing coords info
gridSVGCoords(NA)
gridSVGCoords(firstPlot$coords)


# label observations randomly
z = matrix(sample(1:K, size = nrow(x), replace = T), nrow = nrow(x), ncol = 1)

# cluster counts
n = as.vector(table(z))

# initialize cluster means and variances
phi = matrix(nrow = K, ncol = 2)
phiv = list()

for (i in 1:K){
    phi[i,]   = c(mean(x[,1]) + rnorm(1, sd = 2), mean(x[,2]) + rnorm(1, sd = 2))
    phiv[[i]] = diag(.5, 2) 
}

# display initial configuration
plotter(x = x, z = z)

initialCluster <- vector("list", K)
for (i in 1:K){
    tmp <- ellipse(phi[i,], phiv[[i]],
                   2*(sum(unlist(lapply(phiv, det)))), 4,
                   draw = FALSE)
    initialCluster[[i]] <- tmp
    grid.polygon(x = initialCluster[[i]][, "x"],
                 y = initialCluster[[i]][, "y"],
                 default.units = "native",
                 gp = gpar(col = "black"),
                 name = paste("group-ell-", i, sep = ""))
}

secondPlot <- gridToSVG(NULL, "none", "none")
dev.off()
# Grab the point colours so we can just transition to the first coloured state
points <- querySelectorAllNS(secondPlot$svg, "svg|use",
                             c(svg = "http://www.w3.org/2000/svg"))
initialPointFills <- sapply(points, function(x) xmlGetAttr(x, "fill"))
# Grab the ellipses so we can add them to the plot
ells <- querySelectorAllNS(secondPlot$svg, "svg|g[id^='group-ell']",
                           c(svg = "http://www.w3.org/2000/svg"))
ells <- sapply(ells, function(x) saveXML(x, file = NULL, indent = FALSE))

# hyperparameters
alpha0  = 1
nu0     = rep(1, K)
kappa0  = rep(1, K)

lambda0 = vector("list", K) 
mu0     = vector("list", K) 
for (i in 1:K) {
    lambda0[[i]] = diag(1, 2)
    mu0[[i]]     = c(1, 1)
}

################################################################################
# Inference via collapsed Gibbs sampling.
# Note that this can be collapsed further, but you will lose the ellipses.
################################################################################
simIterations = 100

simData <- vector("list", simIterations)
pointFills <- vector("list", simIterations)
#        R               G               B
pal <- c("rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)")

for (counter in 1:simIterations) {

  # reassign points to clusters, conditional on phi
  for (i in 1:nrow(x)) {
    n_deleted         = n
    current_obs_index = z[i,] 
    if (n_deleted[current_obs_index] > 0)
        n_deleted[z[i,]]  = n_deleted[z[i,]] - 1

    genVector = rep(NA, K)
    for (k in 1:K)
        genVector[k] = dmvnorm(x[i,], phi[k,], phiv[[k]])
    specProb = (n_deleted + alpha0/K)*genVector

    if (any(specProb > 0))
        z[i] = sample(1:K, size = 1, prob = specProb)
  }

  # helper indices; data, grouped by cluster; init sum of squares matrices
  areK = vector("list", K)
  xNew = vector("list", K)
  S    = vector("list", K)
  for (i in 1:K){
      areK[[i]] = which(z == i)
      n[i]      = length(areK[[i]])
      xNew[[i]] = matrix(x[areK[[i]],], ncol = 2)
      S[[i]] = matrix(rep(0, 4), nrow = 2, ncol = 2)
  }

  xMean = lapply(xNew, apply, MARGIN = 2, mean)

  # calculate sum of squares matrices
  for (k in 1:K){
      if (n[k] > 0) {
          for (i in 1:n[k]) {
              if (n[k] == 1) {
                  S[[k]] = S[[k]] + (x[areK[[k]],] - xMean[[k]]) %*% t(x[areK[[k]],] - xMean[[k]])
              } else {
                  S[[k]] = S[[k]] + (x[areK[[k]],][i,] - xMean[[k]]) %*% t(x[areK[[k]],][i,] - xMean[[k]])
              }
          }
      }
  }

  # update parameters after observing data
  kappa  = rep(NA, K)
  nu     = rep(NA, K)
  lambda = vector("list", K)
  mu     = vector("list", K)
  for (i in 1:K){ 
      kappa[i]    = kappa0[i] + n[i]
      nu[i]       = nu0[i] + n[i]

      lambda[[i]] = lambda0[[i]] + S[[i]] + kappa0[i]*n[i]/kappa[i] * ((xMean[[i]] - mu0[[i]]) %*% t(xMean[[i]] - mu0[[i]]))
      mu[[i]]     = mu0[[i]] * kappa0[i]/kappa[i] + xMean[[i]] * n[i]/kappa[i]
  }

  # replace hyperparameters
  for (i in 1:K){
      kappa0[i] = kappa[i]
      nu0[i]    = nu[i]

      lambda0[[i]] = lambda[[i]]
      mu0[[i]]     = mu[[i]]
  }

  # sample from the NIW
  for (i in 1:K){
      if (n[i] > 0){ 
          phiv[[i]] = rwishart(nu[i], solve(lambda[[i]]))$IW
          phi[i,]   = mvrnorm(1, mu[[i]], phiv[[i]]/kappa0[i])
      }
  }

  pointFills[[counter]] <- pal[z]
  simData[[counter]] <- vector("list", K)
  for (i in 1:K){
      tmp <- ellipse(phi[i,], phiv[[i]],
                     min(2*det(phiv[[i]]), 2.5), draw = FALSE)
      # Convert to SVG coords
      tmp[, "x"] <- viewportConvertX("mainvp.1", tmp[ ,"x"], "native")
      tmp[, "y"] <- viewportConvertY("mainvp.1", tmp[ ,"y"], "native")
      # Convert to points attrib
      tmp <- paste(apply(tmp, 1, paste, collapse = ","), collapse = " ")
      simData[[counter]][[i]] <- tmp
  }
}

newData <- list(firstCols = initialPointFills,
                firstCluster = ells,
                pointColours = pointFills,
                simData = simData)


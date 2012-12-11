library(animaker)
library(RJSONIO)

sampSelect <- atomic(label = "sampleSelect",
                     start = 1.5,
                     durn = 1.5)
sampDrop <- atomic(label = "sampleDrop",
                   durn = 1.5)
sampStat <- atomic(label = "sampleStat",
                   durn = 1)
sampStatDrop <- atomic(label = "sampleStatDrop",
                       durn = 1.5)
sampRemove <- atomic(label = "sampleRemove")
statPoint <- atomic(label = "statPoint",
                    durn = 0.5)

singleIter <- vec(sampSelect,
                  sampDrop,
                  sampStat,
                  sampStatDrop,
                  sampRemove,
                  statPoint,
                  label = "singleIter")

final <- rep(vec(singleIter, label = "total"), 20)

# saving to a timing var in JS
jsVar <- paste("var timingData =", toJSON(timing(final)), ";")

# save the entire thing to a file
cat(jsVar, "\n", sep = "", file = "timings.js")


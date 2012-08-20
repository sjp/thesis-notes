library(grid)
library(RJSONIO)
library(gridSVG)
blvp <- viewport(x = unit(0, "npc"),
                 y = unit(0, "npc"),
                 width = unit(0.5, "npc"),
                 height = unit(0.5, "npc"),
                 xscale = c(-10, 45.2),
                 yscale = c(0, 150),
                 just = c("left", "bottom"),
                 name = "blvp")
trvp <- viewport(x = unit(0.5, "npc"),
                 y = unit(0.5, "npc"),
                 width = unit(0.5, "npc"),
                 height = unit(0.5, "npc"),
                 xscale = c(0, 50),
                 yscale = c(-200, 150),
                 just = c("left", "bottom"),
                 name = "trvp")

pushViewport(blvp)
grid.circle(x = unit(1, "cm"), y = unit(1, "cm"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(1, "inches"), y = unit(1, "inches"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(0.8, "npc"), y = unit(0.3, "npc"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(0, "native"), y = unit(100, "native"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(40, "native"), y = unit(30, "native"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.rect()
popViewport()

pushViewport(trvp)
grid.circle(x = unit(1, "cm"), y = unit(1, "cm"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(1, "inches"), y = unit(1, "inches"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(0.8, "npc"), y = unit(0.3, "npc"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(25, "native"), y = unit(-100, "native"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.circle(x = unit(10, "native"), y = unit(0, "native"), r = unit(1, "cm"), gp = gpar(col = "black", fill = "black", pch = 19))
grid.rect()
popViewport()

gridToSVG("location-tests.svg")
dev.off()

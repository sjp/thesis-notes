var switchStyle = function(d, i) {
    var hbin;
    // 0 - Colour
    // 1 - Area
    if (i === 0)
        hbin = colData;
    else
        hbin = areaData;
    var n = hbin.fill.length;

    var legend = d3.select("g[id^='GRID\\.VP']");
    var legendParent = legend.node().parentNode;

    var newLegend = new DOMParser()
        .parseFromString(hbin.legend, "image/svg+xml")
        .documentElement
        .firstChild;
    newLegend = d3.select(newLegend).attr("opacity", 0).node();

    // Fading out
    legend
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    // Adding the new legend
    legendParent.appendChild(newLegend);

    // Ramping up the opacity
    d3.select(newLegend)
        .transition()
        .delay(500)
        .duration(500)
        .attr("opacity", 1);

    // Now transition polygon points and colour
    d3.selectAll("g[clip-path] polygon")
        .transition()
        .duration(1000)
        .attr({
            fill: function(d, i) {
                return hbin.fill[i];   
            },
            stroke: function(d, i) {
                return hbin.fill[i]
            },
            points: function(d, i) {
                return hbin.points[i];
            }
        });
};

d3.selectAll("button")
    .on("click", switchStyle);

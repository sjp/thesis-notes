var moveText = function(d, i) {
    // Also modify the table showing distances between locations
    modifyTableValues(d, i);

    // Highlight the current selection
    d3.selectAll(".nav li")
        .classed("active", function(d, j) {
            return i === j; 
        });

    // Original locs
    if (i === 0) {
        d3.selectAll("#loctext > g")
            .transition()
            .duration(1000)
            .attr({
                transform: function(d, j) {
                    return "translate(" + locs[j][0] + "," + locs[j][1] + ")";
                }
            });
        d3.selectAll("#locpoints > use")
            .transition()
            .duration(1000)
            .attr("fill", "blue");
        return;
    }

    // Remove "all" option, return to 0 indexing
    i = i - 1;

    // All other points require moving [towards]/[away from] ref.
    d3.selectAll("#loctext > g")
        .transition()
        .duration(1000)
        .attr("transform", function(d, j) {
            return "translate(" + xlocs[i][j] + "," + ylocs[i][j] + ")";
        });
    d3.selectAll("#locpoints > use")
        .transition()
        .duration(1000)
        .attr("fill", function(d, j) {
            if (i === j)
                return "red";
            return "blue";
        });
};

var modifyTableValues = function(d, i) {
    var sel = "tbody td:nth-child(2)";
    if (i === 0)
        d3.selectAll(sel).text("");
    else
        d3.selectAll(sel)
            .text(function(d, j) {
                return dists[i - 1][j];
            });
};

var iterateCities = function() {
    if (! this.checked) {
        clearInterval(timerId);
        return;
    }

    var currentCityId = 0;
    timerId = setInterval(function() {
        // Find out which city is selected
        d3.selectAll(".nav li").each(function(d, i) {
            if (d3.select(this).classed("active"))
                currentCityId = i;
        });

        // Wrap if necessary
        if (currentCityId === locs.length)
            currentCityId = 0;
        else
            currentCityId++;
        
        moveText(null, currentCityId);
    }, 5000);
};

d3.selectAll(".nav li a")
    .on("click", moveText);

d3.selectAll("#loctext > g")
    .on("mouseover", function(d, i) {
        d3.select("input[type='checkbox']")
            .property("checked", false);
        clearInterval(timerId);
        moveText(d, i + 1);
    })
    .on("mouseout", function(d, i) {
        moveText(d, 0);
    });

// Needed for disabling iteration
var timerId = 0;
d3.select("input[type='checkbox']")
    .on("change", iterateCities);

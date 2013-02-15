var startAnimation = function() {
    $.ajax({
        url: "/custom/sampvar/brew/anim",
        dataType: "json",
        success: showAnimation
    });
};

var showAnimation = function(obj) {
    // Pulling in data from R
    var sampInds = obj.sampInds;
    var sampLocs = obj.sampLocs;
    var statPoints = new DOMParser()
        .parseFromString(obj.statPoints, "image/svg+xml")
        .documentElement
        .firstChild;
    var ghostsTpl = new DOMParser()
        .parseFromString(obj.sampLines.ghostsTpl, "image/svg+xml")
        .documentElement
        .firstChild;
    var lineTpl = new DOMParser()
        .parseFromString(obj.sampLines.lineTpl, "image/svg+xml")
        .documentElement
        .firstChild;

    var cloneSampleNodes = function(info) {
        var iter = info.vecNum[0] - 1;
        var sampNodes = $("#data-points use")
            .filter(function(i) {
                return _.contains(sampInds[iter], i + 1);
            })
            .clone()
            .appendTo("#data-points")
            .get();

        d3.selectAll(sampNodes)
            .transition()
            .delay(function(d, i) {
                // Show one point at a time
                var step = (1000 * info.durn) / 100;
                return i * step;
            })
            .attr({
                class: "cloned",
                stroke: "black",
                fill: "black",
                opacity: 1,
                "fill-opacity": 1
            });
    };

    var dropSample = function(info) {
        var iter = info.vecNum[0] - 1;
        d3.selectAll("#data-points .cloned")
            .data(sampLocs.y[iter])
            .transition()
            .duration(info.durn * 1000)
            .attr("y", function(d) { return d; });
    };

    var removeSample = function(info) {
        d3.selectAll("#data-points .cloned").remove();
    };

    // Adding the statistic point
    var sampleStat = function(info) {
        var iter = info.vecNum[0] - 1;
        var newPoint = $(statPoints)
            .find("use")
            .eq(iter)
            .clone()
            .get(0);

        var sel = "#wrapper\\:\\:animation\\.field\\:\\:stat\\.3";
        d3.select(sel)
            .append("circle")
            .attr({
                cx: $(newPoint).attr("x"),
                cy: $(newPoint).attr("y"),
                r: 0,
                stroke: "none",
                fill: "steelblue",
                "fill-opacity": 0.5
            })
            .transition()
            .duration(info.durn * 1000)
            .attr({
                r: 250,
                "fill-opacity": 0
            })
            .remove();

        $(sel).append(newPoint);
    };

    // Add sample stat line
    var addStatLine = function(info) {
        var iter = info.vecNum[0] - 1;
        var newGhost = $(ghostsTpl)
            .find("polyline")
            .get(0)
            .cloneNode(true);
        var newLine = $(lineTpl)
            .find("polyline")
            .get(0)
            .cloneNode(true);

        // Modifying the ghost and adding
        newGhost.id = "ghost" + (iter + 1);
        var gd = [obj.sampLines.lineXs[iter],
                  obj.sampLines.ghostLineYs[0],
                  obj.sampLines.ghostLineYs[1]];
        var gp = gd[0] + "," + gd[1] + " " + gd[0] + "," + gd[2];
        newGhost.setAttribute("points", gp);
        $("#sample-xaxis").after(newGhost);

        // Modifying the line and adding
        newLine.id = "sampLine";
        var ld = [obj.sampLines.lineXs[iter],
                  obj.sampLines.lineYs[0],
                  obj.sampLines.lineYs[1]]
        var lp = ld[0] + "," + ld[1] + " " + ld[0] + "," + ld[2];
        newLine.setAttribute("points", lp);
        $("#image").append(newLine);
    };

    var dropSampleStat = function(info) {
        var iter = info.vecNum[0] - 1;

        // Moving the stat line down
        var currStatPoint = $(statPoints)
            .find("use")
            .eq(iter)
            .clone()
            .get(0);
        var lineX = obj.sampLines.lineXs[iter];
        var cspy = currStatPoint.y.baseVal.value;
        var newPoints = lineX + "," + cspy + " " +
                        lineX + "," + cspy;

        d3.select("#sampLine")
            .transition()
            .duration(info.durn * 1000)
            .attr("points", newPoints)
            .remove();
    };

    // Assume timingData holds timing information exported
    // from R via RJSONIO and animaker
    var tm = new TimingManager(timingData, "s");

    // Assign actions to animations
    tm.register({
        sampleSelect: cloneSampleNodes,
        sampleDrop: dropSample,
        sampleStat: addStatLine,
        sampleStatDrop: dropSampleStat,
        sampleRemove: removeSample,
        statPoint: sampleStat
    });

    // Let's go!
    tm.play();
};

// Set up a handler
d3.select("#go-btn")
    .on("click", startAnimation);

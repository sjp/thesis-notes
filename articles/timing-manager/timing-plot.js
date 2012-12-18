var timingPlot = function(info, sel, opts) {
    if (! d3)
        throw new Error("d3 is required");

    // Handle the case where we are just plotting an atomic animation.
    if (! _.isArray(info))
        info = [info];

    // Defaults
    opts = opts || {};
    opts = _.defaults(opts, {
        width: 600,
        height: 600,
        padding: 40,
        caption: null
    });
    var w = opts.width;
    var h = opts.height;
    var pad = opts.padding;
    var caption = opts.caption;

    // Work out the entire duration of the animation
    var animEnd = 0;
    _.each(info, function(i) {
        animEnd = Math.max(i.start + i.durn, animEnd);
    });
    var animRange = [0, animEnd];

    // Get all of the atomic animation labels and assign a
    // colour to them
    var labels = _.uniq(_.map(info, function(i) {
        return i.label; 
    }));
    var animColour = d3.scale.category10()
        .domain(labels);

    var barHeight = (function (h) {
        var space = 20;
        var n = labels.length;
        var totalSpaces = space * (n + 1);
        var boxHeight = h - (2 * pad);
        return (boxHeight - totalSpaces) / n;
    })(h);

    var getBarY = function(label) {
        var i = labels.indexOf(label);
        var spaces = 20 * (i + 1);
        return (i * barHeight) + spaces + pad;
    };

    // Generate a scale for timing
    var xScale = d3.scale.linear()
        .domain(animRange)
        .range([100, w - pad]);

    // Lets build up the wrapping html for this
    var figwrap = d3.select(sel).append("figure");
    var controlDiv = d3.select(sel + " figure")
        .append("div")
        .attr("class", "control-btns");
    var playButton = d3.select(sel + " figure div")
        .append("button")
        .text("Play")
        .on("click", function(d) {
            // If we're in the middle of playing something, remove
            gridbox.selectAll(".fadebox, .hlrect")
                .transition()
                .remove();
            figwrap.select("pre").text("");
            var blocks = gridbox.selectAll(".hlrect")
                .data(info, function(d) { return d; })
                .enter().append("rect")
                .attr("class", "hlrect")
                .attr("x", function(d) { return xScale(d.start); })
                .attr("y", function(d) { return getBarY(d.label); })
                .attr("width", 0)
                .attr("height", barHeight)
                .attr("stroke", "red")
                .attr("stroke-width", 0)
                .attr("fill", "none");
            var fadebox = gridbox.append("rect")
                .attr("class", "fadebox")
                .attr("x", xScale(0))
                .attr("y", pad + 1)
                .attr("height", boxHeight - 2)
                .attr("width", xScale(animRange[1]) - xScale(animRange[0]))
                .attr("stroke", "none")
                .attr("fill", "white")
                .attr("fill-opacity", 0.8);
            var fadeboxLine = gridbox.append("line")
                .attr("class", "fadebox")
                .attr("x1", xScale(0))
                .attr("x2", xScale(0))
                .attr("y1", pad + 1)
                .attr("y2", pad + 1 + (boxHeight - 2))
                .attr("stroke-width", 2)
                .attr("stroke", "grey");

            // Begin the transitions
            fadebox
                .transition()
                .ease("linear")
                .duration(1000 * animRange[1])
                .attr("x", xScale(animRange[1]))
                .attr("width", 0)
                .remove();
            fadeboxLine
                .transition()
                .ease("linear")
                .duration(1000 * animRange[1])
                .attr("x1", xScale(animRange[1]))
                .attr("x2", xScale(animRange[1]))
                .remove();
            blocks
                .transition()
                .delay(function(d) { return 1000 * d.start; })
                .attr("stroke-width", 3)
                .transition()
                .ease("linear")
                .duration(function(d) { return 1000 * d.durn; })
                .attr("width", function(d) {
                    return xScale(d.start + d.durn) - xScale(d.start);
                })
                .each("start", function(d) {
                    var prevText = outputText.text();
                    var newLine = d.label + " started at " +
                                  d.start + "s and runs for " +
                                  d.durn + "s";
                    if (prevText === "") {
                        outputText.text(newLine);
                    } else {
                        outputText.text(prevText + "\n" + newLine);
                    }
                })
                .each("end", function() {
                    d3.select(this).remove();
                });
        });
    var resetButton = d3.select(sel + " figure div")
        .append("button")
        .text("Reset")
        .on("click", function(d) {
            gridbox.selectAll(".fadebox, .hlrect")
                .transition()
                .remove();
            figwrap.select("pre").text("");
        });

    // Draw the main plot window
    var plot = d3.select(sel + " figure")
        .append('svg')
            .attr('width', w)
            .attr('height', h);

    var outputText = d3.select(sel + " figure")
        .append("pre")
        .attr("class", "codeblock")
        .text("");

    if (caption)
        d3.select(sel + " figure")
            .append("figcaption")
            .text(caption);

    // Let's create a box with grid lines and a border
    var gridbox = plot.append("g")
        .attr("class", "box");

    // Border
    var boxHeight = h - (2 * pad) + 2;
    gridbox.append("rect")
        .attr("x", xScale(0) - 1)
        .attr("y", pad)
        .attr("width", xScale(animEnd) - xScale(0) + 2)
        .attr("height", boxHeight)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Add animation blocks
    gridbox.selectAll("rect")
        .data(info, function(d) { return d; })
      .enter().append("rect")
        .attr("class", "animblock")
        .attr("x", function(d) { return xScale(d.start); })
        .attr("y", function(d) { return getBarY(d.label); })
        .attr("width", function(d) {
            return xScale(d.start + d.durn) - xScale(d.start);
        })
        .attr("height", barHeight)
        .attr("fill", function(d) {
            return animColour(d.label);
        });

    // Generate axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(10)
        .tickSize(15)
        .orient("bottom");

    // Horizontal axis labels
    gridbox.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (pad + boxHeight) + ")")
        .call(xAxis);

    // Vertical axis labels
    plot.selectAll("text")
        .data(labels, function(d) { return d; })
      .enter().append("text")
        .attr("x", 90)
        .attr("y", function(d) { return getBarY(d) + (barHeight / 2); })
        .attr("text-anchor", "end")     // right align
        .attr("baseline-shift", "-25%") // vertical centering
        .text(function(d) { return d; });
};


var framePlot = function(info, sel, opts) {
    // Handle the case where we are just plotting an atomic animation.
    if (! _.isArray(info))
        info = [info];

    // Defaults
    opts = opts || {};
    opts = _.defaults(opts, {
        width: 600,
        height: 600,
        padding: 40,
        caption: null
    });
    var w = opts.width;
    var h = opts.height;
    var pad = opts.padding;
    var caption = opts.caption;

    // Get all of the atomic animation labels and assign a
    // colour to them
    var labels = _.uniq(_.map(info, function(i) {
        return i.label; 
    }));
    var animColour = d3.scale.category10()
        .domain(labels);

    var boxHeight = h - (2 * pad);
    var barWidth = (function (w) {
        var space = 20;
        var n = labels.length;
        var totalSpaces = space * (n + 1);
        var boxWidth = w - (2 * pad);
        return (boxWidth - totalSpaces) / n;
    })(w);

    var tm = new TimingManager(info, "s");

    var rectLocDims = _.map(info, function(i) {
        var xind = labels.indexOf(i.label); 
        var x = (xind * barWidth) + ((xind + 1) * 20);
        var y = pad;
        var height = boxHeight;
        var width = barWidth;
        return [i.label, x, y, width, height];
    });

    var clearNonPlayingFrames = function(info) {
        if (! _.isArray(info))
            info = [info];
        var labelsToShow = _.map(info, function(i) { return i.label; });
        var labelsToRemove = [];
        var locDims = [];
        _.each(labels, function(l) {
            if (! _.contains(labelsToShow, l)) {
                labelsToRemove.push(l);
                _.each(rectLocDims, function(dims) {
                    if (dims[0] === l) {
                        locDims.push(dims);
                    }
                });
            }
        });

        if (_.isEmpty(labelsToRemove))
            return;

        _.each(locDims, function(ld) {
            ctx.clearRect(ld[1], ld[2], ld[3], ld[4]);
        });
    };

    var resetAndAddText = function(info) {
        if (! _.isArray(info))
            info = [info];
        
        var namesToAdd = _.map(info, function(i) { return i.label; });
        outputText.text("");
        _.each(namesToAdd, function(name) {
            var prevText = outputText.text();
            frameCounter++;
            if (prevText === "") {
                outputText.text(name + " was executed on frame " + frameCounter);
            } else {
                outputText.text(prevText + "\n" + name + " was executed on frame " + frameCounter);
            }
        });
    };

    var frameCounter = 0;

    tm.register({
        Alpha: function(d) {
            clearNonPlayingFrames(d);
            _.each(rectLocDims, function(rld) {
                if (rld[0] === "Alpha") {
                    ctx.fillStyle = animColour("Alpha");
                    ctx.fillRect(rld[1], rld[2], rld[3], rld[4]);
                }
            });
            resetAndAddText(d);
        },
        Bravo: function(d) {
            clearNonPlayingFrames(d);
            _.each(rectLocDims, function(rld) {
                if (rld[0] === "Bravo") {
                    ctx.fillStyle = animColour("Bravo");
                    ctx.fillRect(rld[1], rld[2], rld[3], rld[4]);
                }
            });
            resetAndAddText(d);
        },
        Charlie: function(d) {
            clearNonPlayingFrames(d);
            _.each(rectLocDims, function(rld) {
                if (rld[0] === "Charlie") {
                    ctx.fillStyle = animColour("Charlie");
                    ctx.fillRect(rld[1], rld[2], rld[3], rld[4]);
                }
            });
            resetAndAddText(d);
        },
        Delta: function(d) {
            clearNonPlayingFrames(d);
            _.each(rectLocDims, function(rld) {
                if (rld[0] === "Delta") {
                    ctx.fillStyle = animColour("Delta");
                    ctx.fillRect(rld[1], rld[2], rld[3], rld[4]);
                }
            });
            resetAndAddText(d);
        }
    });

    // Lets build up the wrapping html for this
    var figwrap = d3.select(sel).append("figure");
    var controlDiv = d3.select(sel + " figure")
        .append("div")
        .attr("class", "control-btns");
    var playButton = d3.select(sel + " figure div")
        .append("button")
        .text("Play")
        .on("click", function(d) {
            frameCounter = 0;
            tm.frameApply(10);
        });

    // Draw the main plot window
    var plot = d3.select(sel + " figure")
        .append('canvas')
            .attr('width', w)
            .attr('height', h);
    var ctx = plot.node().getContext("2d");

    var outputText = d3.select(sel + " figure")
        .append("pre")
        .attr("class", "codeblock")
        .text("");

    if (caption)
        d3.select(sel + " figure")
            .append("figcaption")
            .text(caption);
};


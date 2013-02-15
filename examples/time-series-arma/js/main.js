var drawParams = function(obj) {
    d3.selectAll("#acfheights polyline")
        .data(obj.acf)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });
    d3.selectAll("#pacfheights polyline")
        .data(obj.pacf)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });
};

var updateParams = function() {
    var p = $("#arma-p").val();
    var d = $("#arma-d").val();
    var q = $("#arma-q").val();
    
    $.ajax({
        url: "/custom/arma/brew/acf?" + $.param({
            p: p,
            d: d,
            q: q
        }),
        dataType: "json",
        success: drawParams
    });
};
    
var drawUpdatedDataset = function(obj) {
    obj = JSON.parse(obj);

    // Creating SVG nodes out of SVG text
    var newAcfAxis = new DOMParser()
        .parseFromString(obj.acfAxis, "image/svg+xml")
        .documentElement
        .firstChild;
    var newPacfAxis = new DOMParser()
        .parseFromString(obj.pacfAxis, "image/svg+xml")
        .documentElement
        .firstChild;

    // Setting acf y-axis
    var oldAcfAxis = $("#acfyaxis").get(0);
    d3.select(newAcfAxis).attr("opacity", 0); // Make it invisible first
    $(newAcfAxis).insertBefore(oldAcfAxis);
    
    // Fade out
    d3.select(oldAcfAxis)
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .remove();
    // Fade in
    d3.select(newAcfAxis)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    
    var oldPacfAxis = $("#pacfyaxis").get(0);
    d3.select(newPacfAxis).attr("opacity", 0); // Make it invisible first
    $(newPacfAxis).insertBefore(oldPacfAxis);
    
    // Fade out
    d3.select(oldPacfAxis)
        .transition()
        .duration(1000)
        .attr("opacity", 0)
        .remove();
    // Fade in
    d3.select(newPacfAxis)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    
    // Note that the following values can just be transitioned towards.
    // This is because we are not *replacing*, merely *transforming*.
    // This gives us a nice smooth transition rather than a fade in/out.
    
    // Setting the horizontal lines at y = 0 for both plots
    d3.select("#acfzeroline polyline")
        .transition()
        .duration(1000)
        .attr("points", obj.acfZero);
    d3.select("#pacfzeroline polyline")
        .transition()
        .duration(1000)
        .attr("points", obj.pacfZero);
    
    // Setting the confidence intervals
    d3.selectAll("#acfclims polyline")
        .data(obj.acfClims)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });
    d3.selectAll("#pacfclims polyline")
        .data(obj.pacfClims)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });
    
    // Finally setting the line heights
    d3.selectAll("#acfheights polyline")
        .data(obj.acfHeights)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });
    d3.selectAll("#pacfheights polyline")
        .data(obj.pacfHeights)
        .transition()
        .duration(1000)
        .attr("points", function(d) { return d; });

    // Reset to zero for all ARMA params
    $("#arma-p").val(0);
    $("#arma-d").val(0);
    $("#arma-q").val(0);
};

var changeDataset = function() {
    var dataset = $("#dataset").prop("files")[0];
    var fd = new FormData();
    fd.append("dataset", dataset);
    $.ajax({
        url: "/custom/arma/brew/loadDataset?p=0&d=0&q=0",
        type: "POST",
        data: fd,
        contentType: false,
        processData: false,
        success: drawUpdatedDataset
    });
};        

d3.select("#dataset")
    .on("change", changeDataset);

d3.selectAll("#arma-p, #arma-d, #arma-q")
    .on("change", updateParams);

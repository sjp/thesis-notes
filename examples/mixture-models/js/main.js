var runAnimation = function(d, i) { // ignore params
    d3.selectAll("use")
        .data(newData.firstCols)
        .transition()
        .delay(2000)
        .attr("fill", function(d) { return d; });

    setTimeout(function() {
        var svgHeader = '<svg xmlns="http://www.w3.org/2000/svg">';
        var svgFooter = '</svg>';

        firstGroup = new DOMParser()
            .parseFromString(svgHeader + newData.firstCluster[0] + svgFooter, "image/svg+xml")
            .documentElement
            .firstChild;
        secondGroup = new DOMParser()
            .parseFromString(svgHeader + newData.firstCluster[1] + svgFooter, "image/svg+xml")
            .documentElement
            .firstChild; 
        thirdGroup = new DOMParser()
            .parseFromString(svgHeader + newData.firstCluster[2] + svgFooter, "image/svg+xml")
            .documentElement
            .firstChild; 

        var mainvp = document.querySelector("#mainvp\\.1");
        mainvp.appendChild(firstGroup);
        mainvp.appendChild(secondGroup);
        mainvp.appendChild(thirdGroup);

    }, 2000);

    // Need to redo this with animaker, messy hardcoding!
    for (var j = 0; j < newData.pointColours.length; j++) {
        setTimeout(function(j) {
            d3.selectAll("use")
                .data(newData.pointColours[j])
                .transition()
                .duration(0)
                .attr("fill", function(d) { return d; });
        }, 4000 + ((j + 1) * 100), j);
        setTimeout(function(j) {
            d3.selectAll("polygon")
                .data(newData.simData[j])
                .transition()
                .duration(100)
                .attr("points", function(d) { return d; });
        }, 4000 + ((j + 1) * 100), j);
    }

};

d3.selectAll("button")
    .on("click", runAnimation);

class ScatterPlot {
    constructor(_config, _data, _dispatcher) {
        this.config = {
            colorScale: _config.colorScale,
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || {top: 50, right: 0, bottom: 50, left: 50},
            tooltipPadding: 15,
        };
        this.dispatcher = _dispatcher;
        this.data = _data;
        this.initVis();
    }

    // standard initVis function
    initVis() {
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        vis.xAxis = d3
            .axisBottom(vis.xScale)
            .ticks(4)
            .tickPadding(25);

        vis.yAxis = d3
            .axisLeft(vis.yScale)
            .ticks(10)
            .tickPadding(10);

        // Define size of SVG drawing area
        setupSVG(vis);

        vis.chartArea
            .append("text")
            .attr("class", "axis-title")
            .attr("y", vis.height + 5)
            .attr("x", vis.width)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "end")
            .text("Total Articles");

        vis.chartArea
            .append("text")
            .attr("class", "axis-title")
            .attr("y", -40)
            .attr("x", 0)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "end")
            .text("JIF");

        // add title
        vis.chartArea
            .append("text")
            .attr("class", "title")
            .attr("y", -50)
            .attr("x", 400)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "end")
            .text("Journal Impact Factor vs. Total Articles");

        vis.clip = vis.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("x", 0)
            .attr("y", 0);

        function handleZoom(e) {
            let newX = e.transform.rescaleX(vis.xScale)
            let newY = e.transform.rescaleY(vis.yScale)
            vis.xAxisG.call(d3.axisBottom(newX).ticks(4)
                .tickPadding(25))

            vis.yAxisG.call(d3.axisLeft(newY).ticks(10)
                .tickPadding(10))

            vis.chart
                .selectAll(".point")
                .attr('cx', function (d) {
                    return newX(d['Total Articles'])
                })
                .attr('cy', function (d) {
                    return newY(d['2021 JIF'])
                })
            vis.paths.attr('d', d3.line()
                .x(d => newX(d[0]))
                .y(d => newY(d[1])))
        }

        vis.zoom = d3.zoom()
            .on('zoom', handleZoom)
            .scaleExtent([1, 10])

        vis.svg.call(vis.zoom)
    }

    // Store the current zoom state
    storeZoomState() {
        let vis = this;
        vis.zoomState = d3.zoomTransform(vis.svg.node());
    }

    // Restore the stored zoom state
    restoreZoomState() {
        let vis = this;
        if (vis.zoomState) {
            vis.svg.transition()
                .duration(500)
                .call(vis.zoom.transform, vis.zoomState);
        }
    }

    updateVis() {
        let vis = this;

        // Store the current zoom state
        vis.storeZoomState();

        // filtered out data whose 'Total Articles' is not a number or 0
        vis.data = vis.data.filter(d => d['Total Articles'] > 0 && !isNaN(d['Total Articles']));

        vis.xValue = d => d['Total Articles'];
        vis.yValue = d => d['2021 JIF'];

        // Set the scale domains
        vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
        vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
        vis.renderVis();

        // Restore the stored zoom state
        vis.restoreZoomState();
    }

    renderVis() {

        let vis = this;

        const line = d3r.regressionLinear()(vis.data.map(d => [vis.xValue(d), vis.yValue(d)]));
        vis.paths = vis.chart
            .selectAll('path')
            .data([line])
            .attr('d', d3.line()
                .x(d => vis.xScale(d[0]))
                .y(d => vis.yScale(d[1])))
            .join('path')
            .attr('class', 'regline')
            .attr('fill', 'none')
            .attr('stroke', 'grey')
            .attr('stroke-width', 1)
            .attr('d', d3.line()
                .x(d => vis.xScale(d[0]))
                .y(d => vis.yScale(d[1])));


        const xValues = vis.data.map(d => vis.xValue(d));
        const yValues = vis.data.map(d => vis.yValue(d));
        const corr = d3.format(".2f")(correlationCoefficient(xValues, yValues));

        // Bind the correlation coefficient to a selection of text elements with class 'corr-label'
        const label = vis.chart.selectAll('.corr-label')
            .data([corr])
            .text(d => `Correlation: ${d}`)
            .join('text')
            .attr('class', 'corr-label')
            .attr('text-anchor', 'end')
            .attr('x', vis.width)
            .attr('y', 0)
            .attr('transform', `translate(-10, 20)`)
            .text(d => `Correlation: ${d}`);


        vis.chart.selectAll('.point')
            .data(vis.data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 5)
            .attr("cy", (d) => vis.yScale(vis.yValue(d)))
            .attr("cx", (d) => vis.xScale(vis.xValue(d)))
            .attr("fill", d => vis.config.colorScale(d['Subfield']))
            .attr("opacity", d => {
                let opacity = OPACITY_UNSELECTED;
                if (selectedItems.includes(d)) {
                    opacity = OPACITY_SELECTED;
                }
                return opacity;
            })
            .attr('stroke', d => {
                if (selectedItems.includes(d)) {
                    return "black";
                }
                return null;
            })
            .on("mouseover.tooltip", (event, d) => {
                let quantile = QUARTILE_TO_PERCENTAGE[d['JIF Quartile']]
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
                    .style("top", (event.pageY + vis.config.tooltipPadding) + "px")
                    .html(`<div style="font-size: 12px;"> Name: <strong>${d['Journal name']}</strong></div>
                        <div style="font-size: 12px;">Subfield: ${d.Subfield}</div>
                       <div style="font-size: 12px;">Open Access Rate: ${(d['% of OA Gold'] * 100)
                        .toFixed(2)}%</div>
                        <div style="font-size: 12px;">Total Articles: ${d['Total Articles']}</div>
                        <div style="font-size: 12px;">JIF Quartile: ${quantile}</div>`);
            })
            .on("mouseleave.tooltip", () => {
                d3.select("#tooltip").style("display", "none");
            })
            .on('mouseover.point', function (event, d) {
                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr("fill", d => {
                        let color = vis.config.colorScale(d['Subfield']);
                        color = d3.color(color).darker(HOVER_DARKENING);
                        return color;
                    });
            })
            .on('mouseleave.point', function (event, d) {
                d3.select(this)
                    .attr('stroke', d => {
                        if (selectedItems.includes(d)) {
                            return "black";
                        }
                        return null;
                    })
                    .attr('stroke-width', d => selectedItems.includes(d) ? 1 : 0)
                    .attr("fill", d => vis.config.colorScale(d['Subfield']))
            })


            .on('click', function (event, d) {

                if (selectedItems.includes(d)) {
                    selectedItems.splice(selectedItems.indexOf(d), 1);
                } else {
                    selectedItems.push(d);
                }
                vis.dispatcher.call('selectedItems', event);
            })

        vis.xAxisG.call(vis.xAxis)
        vis.yAxisG.call(vis.yAxis)

    }
}

function setupSVG(vis) {
    vis.svg = d3
        .select(vis.config.parentElement)
        .attr("width", vis.config.containerWidth)
        .attr("height", vis.config.containerHeight);

    vis.chartArea = vis.svg
        .append("g")
        .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Initialize clipping mask that covers the whole chart
    vis.chartArea.append('defs')
        .append('clipPath')
        .attr('id', 'chart-mask')
        .append('rect')
        .attr('width', vis.width)
        .attr('y', 0)
        .attr('height', vis.height);

    // Apply clipping mask to 'vis.chart' to clip circles when they're displaced by zoom
    vis.chart = vis.chartArea.append('g')
        .attr('clip-path', 'url(#chart-mask)');

    vis.xAxisG = vis.chartArea
        .append("g")
        .attr("class", "axis-x-axis")
        .attr("transform", `translate(0,${vis.height})`);

    vis.yAxisG = vis.chartArea.append("g").attr("class", "axis-y-axis");
}

function correlationCoefficient(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const stdDevX = d3.deviation(x);
    const stdDevY = d3.deviation(y);
    const cov = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    const corr = cov / (stdDevX * stdDevY * (n - 1));
    return corr;
}
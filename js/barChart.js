class BarChart {

    constructor(_config, _data, _dispatcher) {
        // Configuration object with defaults
        this.config = {
            colorScale: _config.colorScale,
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || {top: 50, right: 50, bottom: 50, left: 50},
            tooltipPadding: _config.tooltipPadding || 15
        };
        this.dispatcher = _dispatcher;
        this.data = _data;
        this.yLabels = ["", "All", "Top 75%", "Top 50%", "Top 25%"]
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Initialize scales and axes
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);
        vis.xScale = d3.scaleBand().range([0, vis.width]);

        vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0).tickFormat('');

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(4).tickSizeOuter(0)
            .tickFormat((d, i) => this.yLabels[i])

        // call setupSVG function to create the SVG drawing area
        setupSVG(vis);

        vis.svg
            .append("text")
            .attr("class", "axis-title")
            .attr("y", vis.height + 60)
            .attr("x", vis.width + 50)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "end")
            .text("Journals");

        vis.svg
            .append("text")
            .attr("class", "axis-title")
            .attr("y", 5)
            .attr("x", 0)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "start")
            .text("JIF Quartile");

        // add title
        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("y", 5)
            .attr("x", 400)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "end")
            .text("JIF Quartile by Subfield");
    }

    updateVis() {
        let vis = this;
        vis.data = vis.data.filter((d) => d['JIF Quartile'] !== 0);
        // order vis.data by JIF Quartile within the subfield

        // if the JIF Quartile is Q1, then add a attribute value = 1
        vis.data.forEach((d) => {
            if (d['JIF Quartile'] === 'Q1') {
                d.value = 4;
            } else if (d['JIF Quartile'] === 'Q2') {
                d.value = 3;
            } else if (d['JIF Quartile'] === 'Q3') {
                d.value = 2;
            } else if (d['JIF Quartile'] === 'Q4') {
                d.value = 1;
            }
        });

        // sort the data by JIF Quartile
        vis.data.sort((a, b) => d3.ascending(a.value, b.value));
        // group the data by subfield
        vis.groupedData = d3.groups(vis.data, d => d['Subfield']);
        // ungroup the data
        vis.data = vis.groupedData.flatMap((d) => d[1]);

        // Set the scale input domains
        vis.xValue = (d) => d['Journal name'];
        vis.yValue = (d) => d.value;

        // Set the scale input domains
        vis.xScale.domain(vis.data.map((d) => vis.xValue(d)))
        vis.yScale.domain([0, d3.max(vis.data, (d) => vis.yValue(d))])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        // Add rectangles
        let bars = vis.chart
            .selectAll(".bar")
            .data(vis.data)
            .join("rect")
            .attr("class", "bar")
            .attr("fill", d => {
                return vis.config.colorScale(d['Subfield']);
            })
            .attr("opacity", d => {
                let opacity = OPACITY_UNSELECTED;
                if (selectedItems.includes(d)) {
                    opacity = OPACITY_SELECTED;
                }
                return opacity;
            })
            .attr('x', (d) => vis.xScale(vis.xValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', (d) => vis.yScale(vis.yValue(d)))

        bars.on("mouseover.tooltip", (event, d) => {
            let quantile = QUARTILE_TO_PERCENTAGE[d['JIF Quartile']]
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
                .style("top", (event.pageY + vis.config.tooltipPadding) + "px")
                .html(`<div style="font-size: 12px;"> Name: <strong>${d['Journal name']}</strong></div>
                        <div style="font-size: 12px;">Subfield: ${d.Subfield}</div>
                       <div style="font-size: 12px;">Open Access Rate: ${(d['% of OA Gold']*100)
                    .toFixed(2)}%</div>
                        <div style="font-size: 12px;">Total Articles: ${d['Total Articles']}</div>
                        <div style="font-size: 12px;">JIF Quartile: ${quantile}</div>`);
        }).on("mouseleave.tooltip", () => {
            d3.select("#tooltip").style("display", "none");
        }).on('mouseover.bar', function (event, d) {
            d3.select(this)
                .attr("fill", d => {
                    let color = vis.config.colorScale(d['Subfield']);
                    color = d3.color(color).darker(HOVER_DARKENING);
                    return color;
                });
        }).on('mouseleave.bar', function (event, d) {
                d3.select(this)
                    .attr("fill", d => vis.config.colorScale(d['Subfield']))
            })

        bars.on('click', function (event, d) {

            if (selectedItems.includes(d)) {
                selectedItems.splice(selectedItems.indexOf(d), 1);
            } else {
                selectedItems.push(d);
            }
            vis.dispatcher.call('selectedItems', event);
        })

        vis.svg.on("click", function (event) {

            if (event.target.id === "bar-chart") {
                selectedItems = [];
                vis.dispatcher.call('selectedItems', event);
            }
            vis.dispatcher.call('selectedItems', event);
        });

        vis.xAxisG.call(vis.xAxis)
            .call((g) => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").remove());
        vis.yAxisG.call(vis.yAxis)
            .call((g) => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").remove());
    }
}
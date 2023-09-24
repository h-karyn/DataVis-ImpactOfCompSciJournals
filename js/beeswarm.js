class Beeswarm {
    constructor(_config, _data, _dispatcher) {
        // Configuration object with defaults
        this.config = {
            tooltipPadding: _config.tooltipPadding || 15,
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            minSize: _config.minSize || 1,
            maxSize: _config.maxSize || 10,
            containerWidth: _config.containerWidth || 1400,
            containerHeight: _config.containerHeight || 450,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 40}
        }
        this.data = _data;
        this.dispatcher = _dispatcher;
        this.initVis();
    }

    initVis() {
        let vis = this;
        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // initialize scales
        vis.xScale = d3.scaleBand()
            .range([70, vis.width]);

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yScale = d3.scaleLinear()
            .range([0, vis.height]);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.outline = vis.svg.append("rect")
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .attr('stroke', 'black')
            .attr('fill', 'none');

        // SVG Group containing the actual chart; D3 margin convention
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // scale for the cirle marks
        vis.radiusScale = d3.scaleSqrt()
            .range([vis.config.minSize, vis.config.maxSize]);

        // create a static legend
        vis.svg.append("circle").attr("cx", 1280).attr("cy", 400).attr("r", vis.config.minSize).style("stroke", "black").style("fill", "white")
        vis.svg.append("circle").attr("cx", 1280).attr("cy", 430).attr("r", vis.config.maxSize).style("stroke", "black").style("fill", "white")
        vis.svg.append("text").attr("x", 1300).attr("y", 400).text("0% OA gold").style("font-size", "15px").attr("alignment-baseline", "middle")
        vis.svg.append("text").attr("x", 1300).attr("y", 430).text("100% OA gold").style("font-size", "15px").attr("alignment-baseline", "middle")

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')

        vis.svg.append("text")
            .attr("class", "axis-title")
            .attr("y", 10)
            .attr("x", 700)
            .attr("dy", ".71em")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .text("Gold Open Access Rate");
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        let OAArray = Array.from(new Set(vis.data.map((d) => d['% of OA Gold'])));
        let OAdomain = d3.extent(OAArray);
        vis.radiusScale.domain(OAdomain);

        vis.xScale.domain(Array.from(new Set(vis.data.map((d) => d['Subfield']))));
        vis.yScale.domain(d3.extent(Array.from(vis.data.map((d) => d['2021 JIF']))));

        // accessor functions
        vis.xValue = d => d['Subfield'];
        vis.radiusValue = d => d['% of OA Gold'];
        vis.yValue = d => d['2021 JIF'];
        vis.renderVis()
    }

    renderVis() {
        let vis = this;

        let simulation = d3.forceSimulation(vis.data)
            .force("x", d3.forceX().x(d => vis.xScale(vis.xValue(d))).strength(0.6))
            .force("y", d3.forceY(vis.height / 2))
            .force("collide", d3.forceCollide().radius(d => vis.radiusScale(vis.radiusValue(d))))
            // make the simulation stop after 200 ticks
        simulation.tick(200);

        const circles = vis.chart.selectAll('.beeswarmMark')
            .data(vis.data)
            .join('circle')
            .attr('class', 'beeswarmMark')
            .attr('r', d => vis.radiusScale(vis.radiusValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr("fill", function (d) {
                return vis.config.colorScale(vis.xValue(d));
            })
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

        circles.on("mouseover.tooltip", (event, d) => {
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
        })
            .on("mouseleave.tooltip", () => {
                d3.select("#tooltip").style("display", "none");
            })
            .on('mouseover.beeswarmMark', function (event, d) {
                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr("fill", d => {
                        let color = vis.config.colorScale(d['Subfield']);
                        color = d3.color(color).darker(HOVER_DARKENING);
                        return color;
                    });
            })
            .on('mouseleave.beeswarmMark', function (event, d) {
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

        vis.svg.on("click", function (event) {
            if (event.target.id === "beeswarm") {
                selectedItems = [];
                vis.dispatcher.call('selectedItems', event);
            }
            vis.dispatcher.call('selectedItems', event);
        });

        simulation.on("tick", () => {
            d3.selectAll('.beeswarmMark')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        })
    }
}


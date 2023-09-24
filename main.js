let data, beeswarm, barChart, scatterPlot;
const dispatcher = d3.dispatch('selectedItems');
let selectedItems = [];

// define aesthetics constants
const OPACITY_UNSELECTED = 0.55;
const OPACITY_SELECTED = 1;
const HOVER_DARKENING = 1.2;

const QUARTILE_TO_PERCENTAGE = {
    Q1: "Top 25%",
    Q2: "25% - 50%",
    Q3: "50% - 75%",
    Q4: "Bottom 25%"
};

d3.csv("data/data_v2.csv").then((readData) => {
    data = readData;
    data.forEach(d => {
        Object.keys(d).forEach(attr => {
            if(attr === '% of OA Gold') {
                d[attr] = parseFloat(d[attr]) / 100.0;
            } else if(attr === 'Total Articles' || attr === '2021 JIF') {
                d[attr] = +d[attr];
            } else if (attr === 'Subfield') {
                if (d[attr] === 'MEDICAL INFORMATICS - SCIE'
                    ||d[attr] === 'RADIOLOGY, NUCLEAR MEDICINE & MEDICAL IMAGING - SCIE'
                    ||d[attr] === 'MATHEMATICAL & COMPUTATIONAL BIOLOGY - SCIE') {
                    d.Subfield = "BioInfo"
                } else if (d[attr] === 'COMPUTER SCIENCE, INFORMATION SYSTEMS - SCIE'
                    || d[attr] === 'INFORMATION SCIENCE & LIBRARY SCIENCE - SSCI') {
                    d.Subfield = "IT"
                } else if (d[attr] === 'ROBOTICS - SCIE'
                    || d[attr] === 'AUTOMATION & CONTROL SYSTEMS - SCIE'
                    ||d[attr] === 'COMPUTER SCIENCE, CYBERNETICS - SCIE'
                    ||d[attr] === 'COMPUTER SCIENCE, HARDWARE & ARCHITECTURE - SCIE') {
                    d.Subfield = "System_hardware_robotics"
                } else if (d[attr] === 'COMPUTER SCIENCE, ARTIFICIAL INTELLIGENCE - SCIE') {
                    d.Subfield = "AI"
                } else if (d[attr] === 'COMPUTER SCIENCE, INTERDISCIPLINARY APPLICATIONS - SCIE') {
                    d.Subfield = "Interdisciplinary"
                }else if (d[attr] === 'COMPUTER SCIENCE, THEORY & METHODS - SCIE') {
                    d.Subfield = "Methods"
                }else if (d[attr] === 'COMPUTER SCIENCE, SOFTWARE ENGINEERING - SCIE') {
                    d.Subfield = "Software"
                }
            }
        })
    })

    let _colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Array.from(new Set(data.map((d) => d['Subfield']))))


    barChart = new BarChart(
        { parentElement: "#bar-chart",
            colorScale: _colorScale,
        },
        data
        , dispatcher);
    barChart.updateVis();

    scatterPlot = new ScatterPlot(
        { parentElement: "#scatter-plot",
            colorScale: _colorScale,
        }, data, dispatcher);
    scatterPlot.updateVis();

    beeswarm = new Beeswarm({
        parentElement: '#beeswarm',
        colorScale: _colorScale,
        minSize: 2,
        maxSize: 15
    }, data, dispatcher);
    beeswarm.updateVis();

    // style the legend buttons
    _colorScale.domain().forEach(d => {
        d3.select(`.legend-btn[data-type=${d}]`)
            .style("background", _colorScale(d))
    });
}).catch(error => console.error(error));

/**
 * Event listener: use color legend as filter
 */
d3.selectAll('.legend-btn').on('click', function() {
    // Toggle 'inactive' class
    d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

    // Check which categories are active
    let selectedtypes = [];
    d3.selectAll('.legend-btn:not(.inactive)').each(function() {
        selectedtypes.push(d3.select(this).attr('data-type'));
    });

    // Filter data accordingly and update vis
    beeswarm.data = data.filter(d => selectedtypes.includes(d.Subfield));
    beeswarm.updateVis();
    barChart.data = data.filter(d => selectedtypes.includes(d.Subfield));
    barChart.updateVis();
    scatterPlot.data = data.filter(d => selectedtypes.includes(d.Subfield));
    scatterPlot.updateVis();
});

/** add event listener to the BarChart dispatcher*/
dispatcher.on('selectedItems', () => {
    beeswarm.updateVis();
    barChart.updateVis();
    scatterPlot.updateVis();
});
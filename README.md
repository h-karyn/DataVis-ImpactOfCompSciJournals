# Computer Science Journal Citation Report

Topic 
- https://jcr.clarivate.com/jcr/browse-categories

Reference for interactivity 
- https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-annotated-line-chart
- https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-interactive-bar-chart
- https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-responsive-scatter-plot
- https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-static-scatter-plot

Beeswarm plot
- The beeswarm plot was inspired by the one found at https://www.chartfleau.com/tutorials/d3swarm. In particular the force simulation leans heavily on their example.

Zoomable scatterplot
- For the zoomable scatterplot the callback function (seen here as handlezoom()) was heavily modified from https://observablehq.com/@d3/zoomable-scatterplot
- Much of the setup for zoom (clipping and vis.zoom in Initvis()) is inspired by the Zoom with axis https://d3-graph-gallery.com/graph/interactivity_zoom.html
- Preserving the zoomable state: https://stackoverflow.com/questions/51310179/preserve-d3-zoom-state-when-changing-out-svg-contents

Add a regression line 
- https://github.com/HarryStevens/d3-regression
- https://piazza.com/class/lco9akoxugd57g/post/501

Additional help from ChatGPT:
- We used ChatGPT to learn how to preserve the state of zooming/panning 

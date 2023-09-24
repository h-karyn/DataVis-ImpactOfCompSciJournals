# Computer Science Journal Citation Report


## 1. Overview

Publications serve as a critical currency in the academic world, with a journal's impact reflecting the value of the currency. Researchers aspire to publish their work in reputable journals, but it can be daunting to navigate the vast landscape of scholarly publications. In the field of Computer Science alone, there are 1,581 journals spanning 14 subfields $^1$, making it challenging to identify the most suitable journal, especially for junior researchers.

This project aims to use interactive data visualization to provide computer science researchers with a comprehensive overview of the current academic journal landscape, empowering them to make more informed decisions when selecting a journal for their work. We will focus on journal subfields and three key metrics: Open Access rate, Unadjusted Impact vs Adjust Impact, and Journal Impact Factor Quantile. By analyzing these metrics across various subfields, we hope to equip researchers with the knowledge needed to publish their work in high-quality venues.

![thumbnail](https://github.com/h-karyn/InfoVizForAcademicJournals/assets/63256192/d14cdae9-c66a-4369-ae1b-944193b664ce)


## 2. Data and Data Processing

We obtained the dataset from [Journal Citation Report - Clarivate](https://jcr.clarivate.com/jcr/browse-journals?app=jcr&referrer=target%3Dhttps:%2F%2Fjcr.clarivate.com%2Fjcr%2Fbrowse-journals&Init=Yes&authCode=null&SrcApp=IC2LS). The dataset is freely accessible to users who have registered using a school or organization email address.

According to the website, there are **14 subfields** of computer science research: `automation and control systems`, `artificial intelligence`, `cybernetics`, `hardware and architecture`, `information systems`, `interdisciplinary applications`, `software engineering`, `theory and methods`, `information science and library science`, `logic`, `mathematical and computational biology`, `medical informatics`, `radiology, nuclear medicine, and medical imaging`, and `robotics`.

Under the journal tab, we applied filters to use data from 2021 and journals from the 14 subfields mentioned above. We also selected the following columns: `Total Articles`, `2021 JIF`, `JIF Quartile`, and `% of OA Gold`. We downloaded the top 600 entries (sorted by `2021 JIF`) from the website, as this is the only download option available. We applied the specified filters and made the necessary selections before downloading. You can access the dataset by following the same approach, or directly download it from [our Github repo](https://github.com/h-karyn/InfoVizForAcademicJournals.git).

| Attribute  | Type | Cardinality | Range | Notes: |
| --- | --- | --- | --- | --- |
| Journal name | Categorical | 600 | N/A | This attribute contains all the journal that we are interested in. |
| JCR Abbrevation | Categorical | 600 | N/A |  |
| ISSN | Categorical | 578 | N/A |  |
| eISSN | Categorical | 588 | N/A |  |
| 2021 JIF | Quantitative | N/A | 1.854 to 36.615 |  |
| % of OA Gold | Quantitative | N/A | 0% to 100% |  |
| Subfield | Categorical | 12 | N/A |  |
| Total articles | Quantitative | N/A | 282 to 174,344 |  |
| JIF Quartile | Ordinal | 4 | N/A |  |

## 3. Tasks

- Explore all journals to find reputable and impactful ones
- Browse journals to find ones with a high open-access rating
- Analyze topics to discover the most impactful topics in journals today

## 4. Visualizations

The visualization will consist of one legend, tooltips, and three graphs (beeswarm plot, scatter plot, and icicle plot). 

- Legend
    - The legend serves as an interactive filter in the UI.
    - Each color corresponds to a specific subfield.
    - When no subfields are active, all subfields are shown.
    - Active subfields are outlined in black to indicate their selected status.
    - Inactive subfields are not outlined.
    - Inactive subfields will not be displayed on any of the charts
    - Changes to which subfields are active will result in a call to renderVis.
- Tooltip
    - Each mark has a tooltip that displays when hovered over.
    - The tooltip contains information such as the `Journal Name`, `Subfield`, `Open Access Rate`, `2021 JIF`, and `total articles`.
- Beeswarm Plot:
    - From this chart, users can know which subfields have more journals with higher open access rates, and which journals within a subfield have higher open access rates.
    - Each mark is a bubble, whose area is proportional to its open access rate (Larger bubbles represent journals with higher open access rates)
    - Journal with 0% open access rate will have a baseline radius of 2
    - The bubble color reflects the subfield of the journal.
    - Bubbles of the same subfield are located close together.
    - The maximum and minimum size of bubbles should be flexible, depending on the number of active subfields and their open access rates, to avoid overcrowding.
- Scatter plot
    - From this graph, users can know the relationship between the total article and the JIF
    - `JIF` is on the y-axis.
    - `Total articles` is on the x-axis.
    - The colors of the marks correspond to their subfield color.
    - A linear regression line is drawn based on the current points on the scatter plot.
    - A text showing the correlation should be displayed in the top right corner of the scatter plot.
- Icicle Chart
    - From this graph, users will see the proportion of journal from each subfields in four JIF quantile ranges (0% or higher, 25% or higher, 50%or higher and 75% or higher).
    - Each mark is a tiny rectangle
    - The horizontal position encode a journal
    - The vertical position encodes whether a journal’s JIF is in the corresponding quantile
    - Journals of the same subfield are close (grouped) together
- Interactivity:
    - i. lcicle Chart → Scatter Plot
    - ii. Scatter plot → Beeswarm plot:
        - We can use the Scatter plot as an interactive filter for the Scatter plot. If any circle is selected in scatter plot, the corresponding circle in
    - iii. Beeswarm Plot → Scatter Plot:
        - We can use the Beeswarm plot as an interactive filter for the Scatter plot. For example, when the journal of Natural is clicked, the Scatter plot should indicate the position of the journal in the chart by creating a black radius around the circle. Another click of the journal will reset the filter.
        - Clicking on the Beeswarm plot does not reset any selection.
        - Tooltip should work on all the circles.


## 5. Usage Scenarios

- Maiko is a graduate student who is eager to publish his latest paper. At a similar level of journal prestige (Eigenfactor), he is particularly looking for the ones that have a relatively higher JIF, as he thinks that would bring him more citations, too.
- Karyn is an undergraduate student who has not decided on her research topic. She wants to find out which computer science research area has a higher proportion of good journals, so she can choose her research area wisely. She believes that good journals have a high Impact Factor score, so she wants to find topics with the highest proportion of high Impact Factor journals
- Hao Chen as an assistant professor, wants to find open access so that his graduate students can easily test and replicate the work in the published articles. He wants to find journals with high Open Access ratings in his research field (Robotics).


## 6. Acknowledgement
This was a team project for UBC CPSC 447 - Introduction to Data visualization taught by [Dr. Tamara Munzner](https://www.cs.ubc.ca/~tmm/). I came up with this project idea and initial design, and implemented the interactivity for the three subplots. My teammates Hao Chen Lu and Mingyuan Zhu implemented the static version of the subplots. 


## 7. References:

1. [https://jcr.clarivate.com/jcr/browse-categories](https://jcr.clarivate.com/jcr/browse-categories)

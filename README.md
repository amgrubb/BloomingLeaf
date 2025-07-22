# BloomingLeaf
BloomingLeaf is a browser-based tool that uses precise semantics (with Tropos) to model goals and relationships that evolve over time. Simulation techniques are used to enable stakeholders to choose between design alternatives, ask what-if questions, and plan for software evolution in an ever-changing world. BloomingLeaf implements the Evolving Intentions framework. 

BloomingLeaf is developed primarily in [The Grubb Lab](https://amgrubb.github.io/grubb-lab/) at Smith College, but was originally created as part of @amgrubb's [thesis](http://hdl.handle.net/1807/95842) at the University of Toronto. 

**Goals of BloomingLeaf:**
1. Enable modeling of goals with evolving intentions/goals.
2. Enable simulation of goal models as intentions evolve.
3. Enable stakeholders to ask time-based trade-off questions in early-phase requirements engineering.

Review our [overview poster](http://www.cs.toronto.edu/~amgrubb/archive/RE18-Demo-Poster.pdf) to learn more about the original goals of BloomingLeaf Version 1.0. 

BloomingLeaf can be run locally as a `Node` server or online as an `Express` application, see the [setup guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/NODE-README.md) for addtional details. 

## Versions
### *Updates for Version 2.7*
In Version 2.7, we integrated training into the tool itself. We implemented a set of embedded instructional tutorials that aim to guide and instruct first-time goal modelers, while clarifying the common points of confusion. These updates are described in our MoDRE'25 paper.

Additionally, we now allow users to host BloomingLeaf as an Express application, which enables online hosting with the SSL protocol (see updated [setup guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/NODE-README.md)).

### *Updates for Version 2.6*
In Version 2.6, we added the Presences Conditions feature as describe in our MoDRE'23 paper: https://ieeexplore.ieee.org/document/10260777

### *Updates for Version 2.5*
In Version 2.5, we focused on updating the analysis capabilities and a few bug fixes to the interface. 

- We implemented backend capabilities for model merging, as described in [our RE'22 paper](https://ieeexplore.ieee.org/document/9920087).
- We added the EVO capabilities to the *Next State* view and created filters for intention filters, as described in our RE@Next'23 paper.
- We extended the EVO palettes to add more appropriate options for our international audience and users with a color vision deficiency, as describe in our iStar'23 paper.

### *Updates for Version 2.0*
In Version 2.0, we refactored the code base to take advantage of the underlying backbone.js structure:

* removed all global variables in `leaf-ui` and updated the graph data structure
* created backbone models for actors, intentions, evolving functions, configurations, and results
* created backbone views for all backbone models
* allow users to assign absolute values for function segments in the Element Inspector view
* updated and added functionality to the intermediate values table
* updated the communication between the front and backend code
* refactored the backend code base to take advantage of the new backbone models
* fix bugs in the next state view
* updated the look and feel of the tool

See our [summary](https://amgrubb.github.io/posts/2021-08-13-backbone-refactor) for further details about these additions.

### *Updates for Version 1.5*
In Version 1.5, we added the following model-management features (+ additional small features and fixes):

* separate analysis results from model elements
* save / load analysis configurations (num states, etc.)
* save / load analysis results - including a tag
* pair models with analysis results
* clear propagated labels 

See our [poster](https://amgrubb.github.io/posts/2021-04-01-restructuring) for further details about these additions.

## Want to contribute?
The [contributing guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/CONTRIBUTING.md) and [setup guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/NODE-README.md) are good places to start. 
If you have questions, feel free to ask.

## Dependencies
Building on the shoulders of giants:

Tool                  | Description
--------------------- | -----------
[JointJS (Rappid)]               | JavaScript Diagramming Library (v2.3.1)
[JaCoP]              | Java Constraint Programming (JaCoP) solver
[gson](https://github.com/google/gson) |  A Java serialization library to convert Java & JSON
[SweetAlert](https://sweetalert.js.org/)        | Javascript Library for Popup customization
[ChartJS](http://www.chartjs.org/)           | Javascript Library for creating charts
[noUiSlider](https://github.com/leongersen/noUiSlider) | JavaScript range slider library
[KeyboardJS](https://github.com/RobertWHurst/KeyboardJS) | Javascript Libary to easily set up binding keys.

[JointJS (Rappid)]: https://github.com/clientIO/joint
[JaCoP]: https://github.com/radsz/jacop


# BloomingLeaf
BloomingLeaf is a browser-based tool that uses precise semantics (with Tropos) to model goals and relationships that evolve over time. Simulation techniques are used to enable stakeholders to choose between design alternatives, ask what-if questions, and plan for software evolution in an ever-changing world. BloomingLeaf implements the Evolving Intentions framework. 

BloomingLeaf is developed at primarily in [The Grubb Lab](https://amgrubb.github.io/grubb-lab/) at Smith College, but was originally created as part of @amgrubb's [thesis](http://hdl.handle.net/1807/95842) at the University of Toronto. 

**Goals of BloomingLeaf:**
1. Enable modeling of goals with evolving intentions/goals.
2. Enable simulation of goal models as intentions evolve.
3. Enable stakeholders to ask time-based trade-off questions in early-phase requirements engineering.

Review our [overview poster](http://www.cs.toronto.edu/~amgrubb/archive/RE18-Demo-Poster.pdf) to learn more about the original goals of BloomingLeaf Version 1.0. 


## *Updates for Version 1.5*
In Version 1.5, we added the following model-management features (+ additional small features and fixes):

* separate analysis results from model elements
* save / load analysis configurations (num states, etc.)
* save / load analysis results - including a tag
* pair models with analysis results
* clear propagated labels 
* spinner for next states

See our [poster](https://amgrubb.github.io/posts/2021-04-01-restructuring) for further details about these additions.

## Want to contribute?
The [contributing guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/CONTRIBUTING.md) and [Node guide](https://github.com/amgrubb/BloomingLeaf/blob/develop/NODE-README.md) are good places to start. 
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



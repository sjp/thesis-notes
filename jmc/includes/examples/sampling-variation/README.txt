This example uses all of the tools that have been developed.

For the most part, all of the source code used to generate the plots and data
comes resides in the 'R/' directory, but is mostly grid code or generating
samples.

More importantly, the use of animaker by generating timing information is
found in 'brew/timings'.

As the page first loads, it generates a plot using 'brew/mainPlot' and when
the 'Start' button is pressed, data is generated by R in 'brew/anim'.

The use of JavaScript provides the core of the interactivity and animation and
this is implemented in 'js/main.js'.

To run this example, from within this directory use R to source in the
'run-sampvar.R' file.

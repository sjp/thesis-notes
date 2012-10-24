// Creating a couple of animations
var a = new Animation("testanim",
                      function(i) {
                          return function(d, i) {
                              console.log('anim a: iteration: %d lasting: %d', i, d);
                          };
                      },
                      function(i) { return 1000; },
                      function(i) { return (i * 2000); });

var b = new Animation("testanim",
                      function(i) {
                          return function(d, i) {
                              console.log('anim b: iteration: %d lasting: %d', i, d);
                          };
                      },
                      function(i) { return 500; },
                      function(i) { return (i * 5000); });

// Adding the animations to two different tracks
var tr = new Track("testtrack", 10);
var trtwo = new Track("testtracktwo", 5);

tr.addAnimation(a, null);
trtwo.addAnimation(b, null);

// See how long track 1 is
tr.getDuration();

// Adding tracks
Timeline.addTrack(tr);
Timeline.addTrack(trtwo);

// See how long the entire "animation" is
Timeline.totalDuration;

// Let's see the "animation" functions run in the console
Timeline.play();

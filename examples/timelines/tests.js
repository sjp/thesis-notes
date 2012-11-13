// Creating a couple of animations
var a = new Animation("testanima",
                      function(i) {
                          return function(d, i) {
                              console.log('anim a: iteration: %d lasting: %d', i, d);
                          };
                      },
                      1000,
                      function(i) { return (i * 2000); });

var b = new Animation("testanimb",
                      function(i) {
                          return function(d, i) {
                              console.log('anim b: iteration: %d lasting: %d', i, d);
                          };
                      },
                      500,
                      function(i) { return (i * 5000); });

// Adding the animations to two different tracks
var tr = new Track("testtrack", 10);
var trtwo = new Track("testtracktwo", 5);

tr.addAnimation(a);
trtwo.addAnimation(b);

// See how long track 1 is
tr.getDuration();

// Adding tracks to a timeline called "main"
var tl = new Timeline("main");
tl.addTrack(tr);
tl.addTrack(trtwo);

// See how long the entire "animation" is
tl.getTotalDuration();

// Let's see the "animation" functions run in the console
// tl.play();

// Let's play it again after 30s
// tl.play(30000);


// Now that we have built our main timeline, let's see if we can
// nest it within another timeline
var wrapTl = new Timeline("wrapper");
var wrapTrack = new Track("wraptrack", 3);
var wrapAnim = new Animation("wrapanim",
                             function(i) {
                                 return function(d, i) {
                                     console.log('anim wrap: iteration: %d lasting: %d', i, d);
                                 };
                             },
                             200,
                             500);
wrapTrack.addAnimation(wrapAnim);
wrapTl.addTrack(wrapTrack);
wrapTl.addTimeline(tl, 1000);
wrapTl.play();

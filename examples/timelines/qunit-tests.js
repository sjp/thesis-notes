module("Animations");

test("retrieving name", function() {
    var anim = new Animation("an animation", null, 1, 1);
    equal(anim.getName(), "an animation", "animation name correct");
});

test("setting iterations: constant timing", function() {
    var anim = new Animation("test", function(d, i) { return i; }, 1, 1);
    anim.setIterations(10);
    
    var expectedStarts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var expectedEnds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var expectedDurations = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    var actualStarts = [];
    var actualEnds = [];
    var actualDurations = [];

    for (var i = 0; i < 10; i++) {
        actualStarts.push(anim.getStart(i));
        actualEnds.push(anim.getEnd(i));
        actualDurations.push(anim.getDuration(i));
    }

    deepEqual(actualStarts, expectedStarts, "sets starts");
    deepEqual(actualEnds, expectedEnds, "sets ends");
    deepEqual(actualDurations, expectedDurations, "sets durations");
});

test("setting iterations: variable timing", function() {
    var anim = new Animation("test",
                             function(i) { return i; },
                             function(i) { return i; },
                             function(i) { return i; });
    anim.setIterations(10);
    
    var expectedStarts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var expectedEnds = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    var expectedDurations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var actualStarts = [];
    var actualEnds = [];
    var actualDurations = [];

    for (var i = 0; i < 10; i++) {
        actualStarts.push(anim.getStart(i));
        actualEnds.push(anim.getEnd(i));
        actualDurations.push(anim.getDuration(i));
    }

    deepEqual(actualStarts, expectedStarts, "sets starts");
    deepEqual(actualEnds, expectedEnds, "sets ends");
    deepEqual(actualDurations, expectedDurations, "sets durations");
});

test("grabbing animation duration", function() {
    var constAnim = new Animation("test",
                                  function(i) { return i; },
                                  1,
                                  1);
    var varAnim = new Animation("test",
                                function(i) { return i; },
                                function(i) { return i; },
                                function(i) { return i; });
    constAnim.setIterations(10);
    varAnim.setIterations(10);
    equal(constAnim.animLength(), 11, "constant length iterations");
    equal(varAnim.animLength(), 20, "variable length iterations");
});



module("Tracks");

test("tracks work", function() {
    ok(true, "works");
});

module("Timelines");

test("timelines work", function() {
    ok(true, "works");
});

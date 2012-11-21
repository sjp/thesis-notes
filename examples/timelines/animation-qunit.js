module("Animations");

test("retrieving animPath", function() {
    var a = new Animation("a");
    var b = new Animation("b");
    var c = new Animation("c");
    var d = new Animation("d");
    b.addChild(c);
    b.addChild(d);
    a.addChild(b);
    deepEqual(a.getAnimPath(), [], "root path");
    deepEqual(b.getAnimPath(), ["b"], "first descendant path");
    deepEqual(c.getAnimPath(), ["b", "c"], "second descendant path");
    deepEqual(d.getAnimPath(), ["b", "d"], "second child of a descendant");
});

test("toString producing animation tree", function() {
    var a = new Animation("a");
    equal("" + a, "a[0, 0]", "single animation");
    var b = new Animation("b");
    a.addChild(b);
    equal("" + b, "b[0, 0]", "animation after being added");
    equal("" + a, "a[0, 0]\n  b[0, 0]", "animation with child");
});

test("adding children", function() {
    var a = new Animation("a");
    var b = new Animation("b");
    var c = new Animation("c");
    var d = new Animation("d");
    a.addChild(b);
    deepEqual(b.getAnimPath(), ["b"], "simple adding of child to a parent");
    b.addChild(c);
    deepEqual(c.getAnimPath(), ["b", "c"], "child added to previously inserted animation");
    a.addChild(d, {animPath: ["b", "c"]});
    deepEqual(d.getAnimPath(), ["b", "c", "d"], "adding via animation path");
});

test("removing children", function() {
    var a = new Animation("a");
    var b = new Animation("b");
    var c = new Animation("c");
    var d = new Animation("d");
    b.addChild(c);
    b.addChild(d);
    a.addChild(b);
    a.removeChild(["b", "d"]);
    equal("" + a, "a[0, 0]\n  b[0, 0]\n    c[0, 0]", "removal via path");
    a.removeChild("b");
    equal("" + a, "a[0, 0]", "children added and removed");
});

asyncTest("variable delays with iterations", function() {
    expect(15);
    // delays should be the same as cumsum(0:4 * 100)
    var aDelay = [0, 100, 300, 600, 1000];
    // delays should be the same as cumsum(0:9 * 30)
    var bDelay = [0, 30, 90, 180, 300, 450, 630, 840, 1080, 1350];
    var a = new Animation("delay A",
        {
            iter: 5,
            delay: function(i) { return (i - 1) * 100; },
            action: function(d, i) {
                equal(this.getDelay(i), aDelay[i - 1],
                      "Correct variable delay for A on iteration " + i);
            }
        });
    var b = new Animation("delay B",
        {
            iter: 10,
            delay: function(i) { return (i - 1) * 30; },
            action: function(d, i) {
                equal(this.getDelay(i), bDelay[i - 1],
                      "Correct variable delay for B on iteration " + i);
            }
        });
    a.play();
    b.play();

    // Everything must be done after 1500ms
    setTimeout(function() { start(); }, 1500);
});

asyncTest("constant delays with iterations", function() {
    expect(10);
    var aDelay = [100, 200, 300, 400, 500];
    // delays offset by constant duration
    var bDelay = [100, 250, 400, 550, 700];
    var a = new Animation("delay A",
        {
            iter: 5,
            delay: 100,
            action: function(d, i) {
                equal(this.getDelay(i), aDelay[i - 1],
                      "Correct constant delay for A on iteration " + i);
            }
        });
    var b = new Animation("delay B",
        {
            iter: 5,
            delay: 100,
            duration: 50,
            action: function(d, i) {
                equal(this.getDelay(i), bDelay[i - 1],
                      "Correct constant delay for B on iteration " + i);
            }
        });
    a.play();
    b.play();

    // Everything must be done after 1s
    setTimeout(function() { start(); }, 1000);
});

asyncTest("constant delay without iterations", function() {
    expect(2);
    var aDelay = 100;
    var bDelay = 50;
    var a = new Animation("delay A",
        {
            delay: 100,
            action: function(d, i) {
                equal(this.getDelay(i), aDelay,
                      "Correct constant delay for A");
            }
        });
    var b = new Animation("delay B",
        {
            delay: 50,
            duration: 50,
            action: function(d, i) {
                equal(this.getDelay(i), bDelay,
                      "Correct constant delay for B");
            }
        });
    a.play();
    b.play();

    // Everything must be done after 200ms
    setTimeout(function() { start(); }, 200);
});

asyncTest("durations with iterations", function() {
    expect(10);
    var aDurations = [100, 200, 300, 400, 500];
    // constant durations
    var bDurations = 50;
    var a = new Animation("delay A",
        {
            iter: 5,
            duration: function(i) { return i * 100; },
            action: function(d, i) {
                equal(d, aDurations[i - 1],
                      "Correct variable duration for A on iteration " + i);
            }
        });
    var b = new Animation("delay B",
        {
            iter: 5,
            delay: 100,
            duration: 50,
            action: function(d, i) {
                equal(d, bDurations,
                      "Correct constant duration for B on iteration " + i);
            }
        });
    a.play();
    b.play();

    // Everything must be done after 2s
    setTimeout(function() { start(); }, 2000);
});

asyncTest("play children with applied delays", function() {
    expect(0);
    var a = new Animation("delay A",
        {
            iter: 5,
            delay: 5000,
            duration: function(i) { return i * 1000; },
            action: function(d, i) {
                console.log("a %s %s", d, i);
                //equal(d, aDurations[i - 1],
                //      "Correct variable duration for A on iteration " + i);
            }
        });
    var b = new Animation("delay B",
        {
            iter: 5,
            //delay: 10000,
            duration: 50,
            action: function(d, i) {
                console.log("b %s %s", d, i);
                //equal(d, bDurations,
                //      "Correct constant duration for B on iteration " + i);
            }
        });
    a.addChild(b);
    a.play();
});

// Do this by copying objects! Not references!
// Allows us to treat a tree as a single object
// while by reference means we cannot re-use
// an object either because we cannot set different
// children for each separate instance of an object.
//
// ... unfortunately we cannot copy objects...
// only *references* to objects may be copied :(

var TimingManager = function(timingInfo, timeUnit) {
    // If we've just exported a single animation, force it
    // to be an array to generalise the rest of the code to arrays.
    if (! _.isArray(timingInfo)) {
        timingInfo = [timingInfo];
    }

    // Assume milliseconds by default, as that's natural in JS
    timeUnit = timeUnit || "ms";

    var callbacks = {};

    var toMs = function(t) {
        if (timeUnit === "ms") {
            return t;
        } else if (timeUnit === "s") {
            return t * 1000;
        } else if (timeUnit === "m") {
            return t * 60 * 1000;
        } else {
            throw new Error("Unknown time unit: " + timeUnit);
        }
    };

    this.register = function(fns, overwrite) {
        for (var f in fns) {
            if (! callbacks[f] || overwrite)
                callbacks[f] = fns[f];
        }
    };

    var ensureNonEmpty = function() {
        if (_.isEmpty(callbacks))
            throw new Error("No actions assigned to animations");
    };

    this.play = function(t) {
        ensureNonEmpty();
        t = t || 0; // Default to 0 ms
        _.each(timingInfo, function(anim) {
            if (callbacks[anim.label]) {
                _.delay(callbacks[anim.label],
                        t + toMs(anim.start),
                        anim);
            } else {
                console.warn("Ignoring playback of animation: %s", anim.label);
            }
        });
    };

    this.frameTiming = function(t) {
        t = t || 0; // Default to 0ms
        return _.filter(timingInfo, function(info) {
            return (t >= toMs(info.start)) &&
                   (t < toMs(info.start + info.durn));
        });
    };

    this.frameApply = function(fps, t) {
        ensureNonEmpty();
        t = t || 0;
        fps = fps || 10;
        if (fps < 1) {
            throw new Error("Frames per second less than 1");
        }
        var increment = 1000 / fps;
        var durn = 0;
        _.each(timingInfo, function(info) {
            durn = Math.max(durn, toMs(info.start + info.durn));
        });
        var times = [];
        var i;
        for (i = 0; (i * increment) < durn; i++) {
            times.push(t + (i * increment));
        }

        var getCurrentTiming = function(t) {
            return function(info) {
                return (t >= toMs(info.start)) &&
                       (t < toMs(info.start + info.durn));
            };
        };

        var playFrame = function(anim, t) {
            if (callbacks[anim.label]) {
                _.delay(callbacks[anim.label], t, anim);
            } else {
                console.warn("Ignoring playback of animation: %s", anim.label);
            }
        };

        var singleTiming = function(t) {
            return function(info) {
                playFrame(info, t);
            };
        };

        for (i = t; i < _.last(times); i += increment) {
            var currentTiming = _.filter(timingInfo, getCurrentTiming(i));
            if (currentTiming) {
                _.each(currentTiming, singleTiming(i));
            }
        }
    };
};

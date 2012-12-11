var TimingManager = function(timingInfo) {
    // If we've just exported a single animation, force it
    // to be an array to generalise the rest of the code to arrays.
    if (! _.isArray(timingInfo)) {
        timingInfo = [timingInfo];
    }

    var callbacks = {};

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
                        t + (anim.start * 1000),
                        anim);
            } else {
                console.warn("Ignoring playback of animation: %s", anim.label);
            }
        });
    };

    this.frameTiming = function(t) {
        t = t || 0; // Default to 0ms
        return _.filter(timingInfo, function(info) {
            return (t >= (info.start * 1000)) &&
                   (t < ((info.start + info.durn) * 1000));
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
            durn = Math.max(durn, ((info.start + info.durn) * 1000));
        });
        var times = [];
        var i;
        for (i = 0; (i * increment) < durn; i++) {
            times.push(t + (i * increment));
        }

        var getCurrentTiming = function(t) {
            return function(info) {
                return (t >= (info.start * 1000)) &&
                       (t < ((info.start + info.durn) * 1000));
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

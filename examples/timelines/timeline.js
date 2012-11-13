var Timeline = function(name, niter) {
    var totalDuration = 0;
    var tracks = {};
    var timelines = {};
    var start = 0;
    // Handle optional parameter
    if (_.isUndefined(niter)) {
        niter = 1;
    }

    this.toString = function() {
        return "[Timeline " + name + "]";
    };

    this.getIterations = function() {
        return niter;
    }

    this.getTlStart = function() {
        return start;
    };

    this.setTlStart = function(t) {
        start = t;
    };

    this.getName = function() {
        return name;
    };

    this.validateNames = function(tName, animName) {
        if (_.isEmpty(tracks)) {
            console.error("Need > 0 tracks first");
            return;
        }
        var track = tracks[tName];
        if (! tr) {
            console.error("No such track with name '%s'", tName);
        }
        track.validateNames(animName);
        return;
    };

    this.addTimeline = function(tl, start) {
        if (_.isUndefined(start)) {
            start = 0;
        }
        tl.setTlStart(start);
        timelines[tl.getName()] = tl;
        totalDuration = Math.max(totalDuration, tl.getTotalDuration());
    };

    this.removeTimeline = function(tlName) {
        delete timelines[tlName];
        var newTotal = 0;
        _.each(timelines, function(tl) {
            newTotal = Math.max(newTotal, tl.getTotalDuration());
        });
        _.each(tracks, function(track) {
            newTotal = Math.max(newTotal, track.getDuration());
        });
        totalDuration = newTotal;
    };

    this.removeTrack = function(tName) {
        delete tracks[tName];
        var newTotal = 0;
        _.each(tracks, function(track) {
            newTotal = Math.max(newTotal, track.getDuration());
        });
        totalDuration = newTotal;
    };

    this.addTrack = function(track) {
        tracks[track.getName()] = track;
        totalDuration = Math.max(totalDuration, track.getDuration());
    };

    this.getStart = function(tName, animName, iter) {
        this.validateNames(tName, animName);
        var animMin = tracks[tName].animStart(animName, iter);
        if (_.isEmpty(timelines)) {
            return animMin;
        } else {
            var tlMin = 0;
            _.each(timelines, function(tl) {
                tlMin = Math.min(tlMin, tl.getStart());
            });
            return Math.min(animMin, tlMin);
        }
    };

    this.getDuration = function(tName, animName, iter) {
        this.validateNames(tName, animName);
        return tracks[tName].animLength(animName, iter);
    };

    this.getTotalDuration = function() {
        return totalDuration;
    };

    this.setIterations = function(n) {
        niter = n;
        _.each(tracks, function(track) {
            track.setIterations(niter * track.getIterations());
        });
    };

    this.play = function(t) {
        // when we play with no params, assume 0
        if (_.isUndefined(t)) {
            t = 0;
        }

        // If this has an offset, start relative to it.
        t = t + start;

        // Play any nested timelines
        _.each(timelines, function(tl) {
            tl.play(t);
        });

        // Play all tracks
        _.each(tracks, function(track) {
            track.play(t);
        });
    };
};

var Track = function(name, niter) {
    var trackDuration = 0;
    var animations = {};

    this.getName = function() {
        return name;
    };

    this.getIterations = function() {
        return niter;
    };

    this.toString = function() {
        return "[Track " + name + "]";
    };

    this.setIterations = function(niter) {
        _.each(animations, function(anim) {
            anim.setIterations(niter);
        });
    };

    this.validateNames = function(animName) {
        if (_.isEmpty(animations)) {
            console.error("Need > 0 animations in track '%s' first", name);
            return;
        }

        var anim = anims[animName];
        if (! anim) {
            console.error("No such animation with name '%s' in track '%s'", animName, name);
            return;
        }

        return;
    };

    this.addAnimation = function(anim, loc) {
       
        anim.setIterations(niter);

        // The start time is *relative to the reference anim*
        if (! _.isUndefined(loc) && ! _.isNull(loc)) {
            var refAnim = animations[loc];
            for (i = 0; i < niter; i++) {
                anim.setStart(i, anim.getStart(i) + refAnim.getStart(i));
            }
        }

        // Assume that if we are going to be inserting absolutely
        // we can do this safely.
        //
        // Warn in the case where overlapping is present, because
        // this presents a possibility for serial dependence to occur.
        //
        // The use of timelines should be encouraged in this instance.
        if (_.isUndefined(loc) || _.isNull(loc)) {
            _.each(animations, function(cAnim) {
                var overlap = [];

                for (i = 0; i < niter; i++) {
                    overlap.push((anim.getStart(i) > cAnim.getStart(i) && anim.getStart(i) < cAnim.getEnd(i)) ||
                                 (anim.getEnd(i) > cAnim.getStart(i) && anim.getEnd(i) < cAnim.getEnd(i)));
                }

                if (_.any(overlap)) {
                    console.warning("Inserted animation '%s' overlaps with animation '%s'",
                                    anim.getName(), cAnim.getName());
                }
            });
        }

        // Update track durations
        trackDuration = Math.max(trackDuration, anim.getEnd(niter));

        animations[anim.getName()] = anim;
    };

    this.removeAnimation = function(name) {
        delete animations[name];
    };

    this.animStart = function(name, iter) {
        var anim = animations[name];
        return anim.starts[(iter - 1)];
    };

    this.animDuration = function(name, iter) {
        var anim = animations[name];
        return anim.durations[(iter - 1)];
    };

    this.getDuration = function() {
        return trackDuration;
    };

    this.play = function(t) {
        if (_.isUndefined(t)) {
            t = 0;
        }

        _.each(animations, function(anim) {
            for (var i = 0; i < niter; i++) {
                _.delay(anim.getAnimation(i),
                        t + anim.getStart(i),
                        anim.getDuration(i),
                        i + 1);
            }
        });
    };
};

var Animation = function(name, animfn, durationfn, startfn) {
    var anims = [];
    var durations = [];
    var starts = [];
    var ends = [];

    this.toString = function() {
        return "[Animation " + name + "]";
    };

    this.getName = function() {
        return name;
    };

    // If we have constants here, wrap them in appropriate functions
    if (_.isNumber(durationfn)) {
        var durationVal = durationfn;
        durationfn = function(i) {
            return durationVal;
        };
    }
    if (_.isNumber(startfn)) {
        var startVal = startfn;
        startfn = function(i) {
            return startVal;
        };
    }

    this.start = startfn;
    this.anim = animfn;
    this.duration = durationfn;

    this.getStart = function(i) {
        return starts[i];
    };

    this.setStart = function(i, t) {
        starts[i] = t;
    };

    this.getAnimation = function(i) {
        return anims[i];
    };

    this.getDuration = function(i) {
        return durations[i];
    };

    this.getEnd = function(i) {
        return ends[i];
    };

    this.setIterations = function(niter) {
        var newAnims = [];
        var newDurations = [];
        var newStarts = [];
        var newEnds = [];
        for (var i = 0; i < niter; i++) {
            newAnims.push(this.anim(i + 1));
            newDurations.push(this.duration(i + 1));
            newStarts.push(this.start(i + 1));
            newEnds.push(newStarts[i] + newDurations[i]);
        }
        anims = newAnims;
        durations = newDurations;
        starts = newStarts;
        ends = newEnds;
    };

    this.animLength = function() {
        _.last(ends);
    };
};


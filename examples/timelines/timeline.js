var Timeline = function(name) {
    this.name = name;
    this.totalDuration = 0;
    this.tracks = {};
    this.timelines = {};
    this.start = 0;

    this.validateNames = function(tName, animName) {
        if (this.tracks.length === 0) {
            console.error("Need > 0 tracks first");
            return;
        }
        var track = this.tracks[tName];
        if (! tr) {
            console.error("No such track with name '%s'", tName);
        }
        var anims = track.getAnimations();
        if (anims.length === 0) {
            console.error("Need > 0 animations in track '%s' first", tName);
            return;
        }
        var anim = anims[animName];
        if (! anim) {
            console.error("No such animation with name '%s' in track '%s'", animName, tName);
            return;
        }
        return;
    };

    this.addTimeline = function(tl, start) {
        if (_.isUndefined(start)) {
            start = 0;
        }
        tl.start = start;
        this.timelines[tl.name] = tl;
        this.totalDuration = Math.max(this.totalDuration, tl.totalDuration);
    };

    this.removeTimeline = function(tlName) {
        delete this.timelines[tlName];
        var newTotal = 0;
        for (var tl in this.timelines) {
            newTotal = Math.max(newTotal, tl.totalDuration);
        }
        for (var track in this.tracks) {
            newTotal = Math.max(newTotal, track.getDuration());
        }
        this.totalDuration = newTotal;
    };

    this.removeTrack = function(tName) {
        delete this.tracks[tName];
        var newTotal = 0;
        for (var track in this.tracks) {
            newTotal = Math.max(newTotal, track.getDuration());
        }
        this.totalDuration = newTotal;
    };

    this.addTrack = function(track) {
        this.tracks[track.name] = track;
        this.totalDuration = Math.max(this.totalDuration, track.getDuration());
    };

    this.getStart = function(tName, animName, iter) {
        this.validateNames(tName, animName);
        var animMin = this.tracks[tName].animStart(animName, iter);
        if (timelines.length === 0) {
            return animMin;
        } else {
            var tlMin = 0;
            for (var tl in this.timelines) {
                tlMin = Math.min(tlMin, tl.start);
            }
            return Math.min(animMin, tlMin);
        }
    };

    this.getDuration = function(tName, animName, iter) {
        this.validateNames(tName, animName);
        return this.tracks[tName].animLength(animName, iter);
    };

    this.play = function(t) {
        // when we play with no params, assume 0
        if (_.isUndefined(t)) {
            t = 0;
        }

        // If we have timelines within timelines
        for (var tl in this.timelines) {
            var cTl = this.timelines[tl];
            cTl.play(t + cTl.start);
        }

        for (var track in this.tracks) {
            var cTrack = this.tracks[track];
            for (var anim in cTrack.animations) {
                var cAnim = cTrack.animations[anim];
                for (var i = 0; i < cTrack.niter; i++) {
                    _.delay(cAnim.anims[i], t + cAnim.starts[i], cAnim.durations[i], i + 1);
                }
            }
        }
    };
};

var Track = function(name, niter) {
    this.name = name;
    this.trackDuration = 0;
    this.animations = {};
    this.niter = niter;

    this.setIterations = function(niter) {
        for (var anim in this.animations) {
            this.animations[anim].setIterations(niter);
        }
    };

    this.addAnimation = function(anim, loc) {
       
        anim.setIterations(this.niter);

        // The start time is *relative to the reference anim*
        if (! _.isUndefined(loc) && ! _.isNull(loc)) {
            var refAnim = this.animations[loc];
            for (i = 0; i < this.niter; i++) {
                anim.starts[i] = anim.starts[i] + refAnim.starts[i];
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
            for (var a in this.animations) {
                var cAnim = this.animations[a];
                var overlap = [];

                for (i = 0; i < this.niter; i++) {
                    overlap.push(anim.starts[i] > cAnim.starts[i] && anim.ends[i] < refAnim.ends[i]);
                }

                if (_.any(overlap)) {
                    console.warning("Inserted animation '%s' overlaps with animation '%s'", anim.name, cAnim.name);
                }
            }
        }

        // Update track durations
        this.trackDuration = Math.max(this.trackDuration, _.last(anim.ends));

        this.animations[anim.name] = anim;
    };

    this.removeAnimation = function(name) {
        delete this.animations[name];
    };

    this.animStart = function(name, iter) {
        var anim = this.animations[name];
        return anim.starts[(iter - 1)];
    };

    this.animDuration = function(name, iter) {
        var anim = this.animations[name];
        return anim.durations[(iter - 1)];
    };

    this.getDuration = function() {
        return this.trackDuration;
    };
};

var Animation = function(name, animfn, durationfn, startfn) {
    this.name = name;
    this.anims = [];
    this.durations = [];
    this.starts = [];
    this.ends = [];

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

    this.setIterations = function(niter) {
        var anims = [];
        var durations = [];
        var starts = [];
        var ends = [];
        for (var i = 0; i < niter; i++) {
            anims.push(this.anim(i + 1));
            durations.push(this.duration(i + 1));
            starts.push(this.start(i + 1));
            ends.push(starts[i] + durations[i]);
        }
        this.anims = anims;
        this.durations = durations;
        this.starts = starts;
        this.ends = ends;
    };

    this.animLength = function() {
        _.last(this.ends);
    };
};


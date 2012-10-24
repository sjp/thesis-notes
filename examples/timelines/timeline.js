var Timeline = {
    totalDuration: 0,
    tracks: {},
    validateNames: function(tName, animName) {
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
    },

    removeTrack: function(tName) {
        delete this.tracks[tName];
    },

    addTrack: function(track) {
        this.tracks[track.name] = track;
        this.totalDuration = Math.max(this.totalDuration, track.getDuration());
    },

    getStart: function(tName, animName, iter) {
        this.validateNames(tName, animName);
        return this.tracks[tName].animStart(animName, iter);
    },

    getDuration: function(tName, animName, iter) {
        this.validateNames(tName, animName);
        return this.tracks[tName].animLength(animName, iter);
    },

    play: function() {
        for (var track in this.tracks) {
            var cTrack = this.tracks[track];
            for (var anim in cTrack.animations) {
                var cAnim = cTrack.animations[anim];
                for (var i = 0; i < cTrack.niter; i++) {
                    _.delay(cAnim.anims[i], cAnim.starts[i], cAnim.durations[i], i + 1);
                }
            }
        }
    }
};

var Track = function(name, niter) {

    var setIterations = function(niter) {
        for (var anim in this.animations) {
            this.animations[anim].setIterations(niter);
        }
    };

    var addAnimation = function(anim, loc) {
       
        anim.setIterations(this.niter);

        // The start time is *relative to the reference anim*
        if (! _.isNull(loc)) {
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
        if (_.isNull(loc)) {
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

    var removeAnimation = function(name) {
        delete this.animations[name];
    };

    var animStart = function(name, iter) {
        var anim = this.animations[name];
        return anim.starts[(iter - 1)];
    };

    var animDuration = function(name, iter) {
        var anim = this.animations[name];
        return anim.durations[(iter - 1)];
    };

    var getDuration = function() {
        return this.trackDuration;
    };

    return {
        name: name,
        niter: niter,
        trackDuration: 0,
        animations: {},
        setIterations: setIterations,
        addAnimation: addAnimation,
        removeAnimation: removeAnimation,
        animStart: animStart,
        animDuration: animDuration,
        getDuration: getDuration
    };
};

var Animation = function(name, animfn, durationfn, startfn) {

    var setIterations = function(niter) {
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

    var animLength = function() {
        _.last(this.ends);
    };

    return {
        name: name,
        anims: [],
        durations: [],
        starts: [],
        ends: [],
        anim: animfn,
        duration: durationfn,
        start: startfn,
        setIterations: setIterations,
        animLength: animLength
    };

};


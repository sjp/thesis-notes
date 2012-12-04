var anim = function() {
    var getLength = function() {
        return 1;
    };

    var print = function() {
        console.log(this.toString());   
    };

    return {
        getLength: getLength,
        print: print,
        type: "anim"
    };
};

var atomic = function(opts) {
    opts = opts || {};
    opts = _.defaults(_.clone(opts), {
        start: 0,
        duration: 0,
        label: "atomic"
    });
    var start = opts.start;
    var duration = opts.duration;
    var label = opts.label;

    var getStart = function() {
        return start;
    };

    var getDuration = function() {
        return duration;
    };

    var toString = function() {
        return [label, start, duration].join(":");
    };

    var rep = function(opts, createVec) {
        opts = opts || {};
        createVec = ! (createVec || false); // default to true
        opts = _.defaults(opts, {
            each: 1,
            times: 1,
            len: null
        });
        
        var each = opts.each;
        var times = opts.times;
        var len = opts.len;
        
        // Because we have a *single* element, we don't need to perform
        // anything tricky because each arg is (for all intents and purposes) the same.
        var nreps = Math.max(each, times);
        if (! _.isNull(len)) {
            nreps = Math.max(nreps, len);
        }
        
        var anims = [];
        // Context will change as we go to call vec
        var that = this;
        
        _.times(nreps, function() {
            anims.push(that);
        });
        
        if (createVec) {
            return vec.apply(null, anims);
        } else {
            return trac.apply(null, anims);
        }
    };
    
    var timingInfo = function(opts) {
        // At the time of calling, work out what 'this' is.
        // Having parents can confuse this otherwise...
        var that = this;
        opts = opts || {};
        opts = _.defaults(opts, {
            s: that.getStart(),
            d: that.getDuration(),
            lab: that.label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null
        });

        var print = function() {
            var stringVal = function(val) {
                if (_.isNull(val)) {
                    return "N/A";
                } else if (_.isArray(val)) {
                    return val.join(":");
                } else {
                    return val.toString();
                }
            };
            var v = stringVal(this.vec);
            var vNum = stringVal(this.vecNum);
            var t = stringVal(this.trac);    
            var tNum = stringVal(this.tracNum);
            return this.label + ", " +
                   this.start + ", " +
                   this.duration + ", " +
                   v + ", " +
                   vNum + ", " +
                   t + ", " +
                   tNum;
        };

        // Rename some of the keys
        var info = {
            start: opts.s,
            duration: opts.d,
            label: opts.lab,
            vec: opts.vec,
            vecNum: opts.vecNum,
            trac: opts.trac,
            tracNum: opts.tracNum,
            toString: print
        };

        return info;
    };

    var timing = function(opts) {
        var that = this;
        opts = opts || {};
        // Removing 'lab' because we never want this supplied
        // as this could otherwise be given by a parent.
        opts = _.omit(opts, "lab");
        opts = _.defaults(opts, {
            s: that.getStart(),
            d: that.getDuration(),
            lab: that.label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });
        // Apply offset, then remove
        opts.s = opts.offset + opts.s;
        opts = _.omit(opts, "offset");

        var boundTI = _.bind(timingInfo, that);
        return boundTI(opts);
    };

    var printTiming = function(header) {
        header = header || false;
        var t = this.timing();

        if (header) {
            console.log("label, start, duration, vec, vecNum, trac, tracNum");
        }

        console.log(t.toString());
    };

    var that = new anim();
    that.start = start;
    that.duration = duration;
    that.label = label;
    that.rep = rep;
    that.getStart = getStart;
    that.getDuration = getDuration;
    that.timing = timing;
    that.printTiming = printTiming;
    that.toString = toString;
    that.type = ["atomicAnim", "anim"];

    return that;
};

var container = function(anims, opts) {
    opts = opts || {};
    opts = _.defaults(_.clone(opts), {
        start: 0,
        duration: null,
        label: "container"
    });
    var start = opts.start;
    var duration = opts.duration;
    var label = opts.label;

    var validateContainer = function(anims, start, duration) {
        var validContents = _.all(_.map(anims, function(a) {
            return _.contains(a.type, "anim");
        }));
        if (_.size(anims) && ! validContents) {
            throw new Error("Invalid contents of container");
        }

        if (! _.isArray(start)) {
            start = [start];
        }
        if (! _.isArray(duration) && ! _.isNull(duration)) {
            duration = [duration];
        }

        var startIsNumber = _.all(_.map(start, function(s) {
            return _.isNumber(s);   
        }));
        // start has to be numeric and either length 1 or length(anims)
        if (! (startIsNumber && (_.size(start) === 1 || _.size(start) === _.size(anims)))) {
            throw new Error("Invalid start of container");
        }

        var durationIsNumber; 
        if (! _.isArray(duration)) {
            durationIsNumber = false;
        } else {
            durationIsNumber = _.all(_.map(duration, function(d) {
                return _.isNumber(d);   
            }));
        }
        // duration has to be null or numeric and either length 1 or length(anims)
        if (! (_.isNull(duration) || (durationIsNumber &&
               (_.size(duration) === 1 || _.size(duration) === _.size(anims))))) {
            throw new Error("Invalid duration of container");
        }
    };

    validateContainer(anims, start, duration);

    var getLength = function() {
        return _.size(this.anims);
    };

    var print = function() {
        return _.map(this.anims, function(a) {
            return a.toString();
        });
    };

    var setStart = function(value) {
        start = value;
    };

    var setDuration = function(value) {
        duration = value;
    };

    var checkSpliceArgs = function(after, at) {
        if (! _.isNull(after) && ! _.isNull(at)) {
            throw new Error("Cannot specify both after and at");
        }
        
        if (! _.isNull(after) &&
            (after < 0 || after > (this.getLength() - 1))) {
            throw new Error("Invalid after");
        }
        
        if (! _.isNull(at) &&
            (at < 0 || at > (this.getLength() - 1))) {
            throw new Error("Invalid at");
        }
    }
    
    var appendAnim = function(values, after) {
        after = after || this.getLength();
        var firstPiece, lastPiece;

        // Add the animations
        if (after < 0) {
            this.anims = values.anims.concat(this.anims);
        } else if (after < (this.anims.length - 1)) {
            firstPiece = this.anims.slice(0, after + 1);
            lastPiece = this.anims.slice(after + 1);
            this.anims = firstPiece.concat(values.anims, lastPiece);
        } else {
            this.anims = this.anims.concat(values.anims);
        }

        if (_.isArray(this.start) && _.size(this.start) > 1) {
            if (_.isArray(values.start) && _.size(values.start) > 1) {
                if (after < 0) {
                    this.start = values.start.concat(this.start);
                } else if (after < (this.start.length - 1)) {
                    firstPiece = this.start.slice(0, after + 1);
                    lastPiece = this.start.slice(after + 1);
                    this.start = firstPiece.concat(values.start, lastPiece);
                } else {
                    this.start = this.start.concat(values.start);
                }
            }
        } else {
            if (_.isArray(values.start) && _.size(values.start) > 1) {
                console.warning("Dropping start information on assignment");
            }
        }

        if (! _.isNull(this.duration) &&
            (_.isArray(this.duration) && _.size(this.duration) > 1)) {
            if (! _.isNull(values.duration) &&
                (_.isArray(values.duration) && _.size(values.duration) > 1)) {
                if (after < 0) {
                    this.duration = values.duration.concat(this.duration);
                } else if (after < (this.duration.length - 1)) {
                    firstPiece = this.duration.slice(0, after + 1);
                    lastPiece = this.duration.slice(after + 1);
                    this.duration = firstPiece.concat(values.duration, lastPiece);
                } else {
                    this.duration = this.duration.concat(values.duration);
                }
            } else {
                var childDurations = _.map(values.anims, function(a) {
                    return a.getDuration();
                });
                if (after < 0) {
                    this.duration = childDurations.concat(this.duration);
                } else if (after < (this.duration.length - 1)) {
                    firstPiece = this.duration.slice(0, after + 1);
                    lastPiece = this.duration.slice(after + 1);
                    this.duration = firstPiece.concat(childDurations, lastPiece);
                } else {
                    this.duration = this.duration.concat(childDurations);
                }
            }
        } else {
            if (! _.isNull(values.duration) && 
                (_.isArray(values.duration) && _.size(values.duration) > 1)) {
                console.warning("Dropping duration information on assignment");
            }
        }
    };
    
    // A bit of a pain but we'd like to replicate as we would
    // using R's rep() function. The only difference (hopefully)
    // should be that 'length.out' becomes 'len'
    var rep = function(opts) {
        opts = opts || {};
        opts = _.defaults(opts, {
            times: 1,
            each: 1,
            len: null
        });

        var times = opts.times;
        var each = opts.each;
        var len = opts.len;

        var newAnims, newStart, newDuration;

        if (each > 1) {
            newAnims = newAnims || this.anims;
            _.each(this.anims, function(a) {
                _.times(each, function() {
                    newAnims.push(a);
                });
            });
            
            if (_.isArray(this.start) && _.size(this.start) > 1) {
                newStart = newStart || this.start;
                _.each(this.start, function(s) {
                    _.times(each, function() {
                        newStart.push(s);
                    });
                });
            }

            if (! _.isNull(this.duration) &&
                (_.isArray(this.duration) && _.size(this.duration) > 1)) {
                 newDuration = newDuration || this.duration;
                _.each(this.duration, function(d) {
                    _.times(each, function() {
                        newDuration.push(d);
                    });
                });
            }
        }

        if (times > 1) {
            var prevAnims = newAnims || this.anims;
            newAnims = [];

            _.times(times, function() {
                newAnims = newAnims.concat(prevAnims);
            });

            if (_.isArray(this.start) && _.size(this.start) > 1) {
                var prevStart = newStart || this.start;
                newStart = [];
                _.times(times, function() {
                    newStart = newStart.concat(prevStart);
                });
            }

            if (! _.isNull(this.duration) &&
                (_.isArray(this.duration) && _.size(this.duration) > 1)) {
                var prevDuration = newDuration || this.start;
                newDuration = [];
                _.times(times, function() {
                    newDuration = newDuration.concat(prevDuration);
                });
            }
        }

        if (! _.isNull(len)) {
            newAnims = newAnims || this.anims;
            newStart = newStart || this.start;
            newDuration = newDuration || this.duration; 
            var repStart = _.isArray(newStart) && _.size(newStart) > 1;
            var repDuration = _.isArray(newDuration) && _.size(newDuration) > 1;
            var n = _.size(newAnims);

            // Subset results
            if (len < n) {
                newAnims = newAnims.slice(0, len);
                if (repStart) {
                    newStart = newStart.slice(0, len);
                }
                if (repDuration) {
                    newDuration = newDuration.slice(0, len);
                }
            }
            // Repeat results
            if (len > n) {
                _.times(len - n, function(i) {
                    // Correct for case where we're extending by more
                    // than n elements
                    i = i % n;
                    newAnims.push(newAnims[i]);
                    if (repStart) {
                        newStart.push(newStart[i]);
                    }
                    if (repDuration) {
                        newDuration.push(newDuration[i]);
                    }
                });
            }
        }

        this.anims = newAnims || this.anims;
        this.start = newStart || this.start;
        this.duration = newDuration || this.duration;
    };

    var getDurations = function() {
        if (_.isNull(duration) || _.isNumber(duration)) {
            return _.map(this.anims, function(a) {
                return a.getDuration();
            });
        } else {
            return duration;
        }
    };  

    var printTiming = function(header) {
        header = header || false;
        var timings = this.timing();

        if (header) {
            console.log("label, start, duration, vec, vecNum, trac, tracNum");
        }

        // flatten in the case where we have containers within containers
        timings = _.flatten(timings);
        _.each(timings, function(t) {
            console.log(t.toString());
        });
    };

    var setAnims = function(index) {
        var tmpAnims = [];
        for (var i = 0; i < _.size(index); i++) {
            tmpAnims.push(this.anims[index[i]]);
        }
        this.anims = tmpAnims;
    };

    var subset = function(index, list) {
        if (_.isNumber(index)) {
            index = [index];
        }
        list = list || false;
        if (list) {
            var subStart = [], subDuration = [];
            _.each(index, function(ind) {
                if (! _.isNumber(start)) {
                    subStart.push(start[ind]);
                }
                if (! _.isNull(duration) && ! _.isNumber(duration)) {
                    subDuration.push(duration[ind]);
                }
            });

            this.setAnims(index);
            if (_.size(subStart) > 0) {
                setStart(subStart);
            }
            if (_.size(subDuration) > 0) {
                setDuration(subDuration);
            }

            return this;
        } else {
            // Only 1 value at a time is legal
            return this.anims[index[0]];
        }
    };

    var setSubset = function(value, index, list) {
        if (_.isNumber(index)) {
            index = [index];
        }
        list = list || false;
        if (! list) {
            if (! _.contains(value.type, "anim")) {
                throw new Error("Invalid value to assign");
            }
            _.each(index, function(i) {
                this.anims[i] = value;
            }, this);
            return;
        }

        // Because we cannot use something like NextMethod in JS,
        // check for class here
        if (_.contains(this.type, "vecAnim")) {
            if (! _.contains(value.type, "vecAnim")) {
                throw new Error("Invalid value to assign");
            }
        }
        if (_.contains(this.type, "tracAnim")) {
            if (! _.contains(value.type, "tracAnim")) {
                throw new Error("Invalid value to assign");
            }
        }

        // Need to assign and validate
        for (var i = 0; i < _.size(index); i++) {
            this.anims[index[i]] = value.anims[i];
        }
        if (_.isArray(this.start) && _.size(this.start) > 1) {
            if (_.isArray(value.start) && _.size(value.start) > 1) {
                for (i = 0; i < _.size(index); i++) {
                    this.start[index[i]] = value.start[i];
                }
            } else {
                var calcStarts = _.map(value.anims, function(a) {
                    return a.getStart();    
                });
                for (i = 0; i < _.size(index); i++) {
                    this.start[index[i]] = calcStarts[i];
                }
            }
        } else {
            if (_.isArray(value.start) && _.size(value.start) > 1) {
                console.warning("Dropping start information on assignment");
            }
        }
        if (! _.isNull(this.duration) &&
            (_.isArray(this.duration) && _.size(this.duration) > 1)) {
            if (! _.isNull(value.duration) &&
                (_.isArray(value.duration) && _.size(value.duration) > 1)) {
                this.duration[index[i]] = value.duration[i];
            } else {
                var calcDurations = _.map(value.anims, function(a) {
                    return a.getDuration();    
                });
                for (i = 0; i < _.size(index); i++) {
                    this.duration[index[i]] = calcDurations[i];
                }
            }
        } else {
            if (! _.isNull(value.duration) &&
                (_.isArray(value.duration) && _.size(value.duration) > 1)) {
                console.warning("Dropping duration information on assignment");
            }
        }
        return;
    };

    var that = new anim();
    that.anims = anims;
    that.start = start;
    that.duration = duration;
    that.label = label;
    that.validateContainer = validateContainer;
    that.checkSpliceArgs = checkSpliceArgs;
    that.appendAnim = appendAnim;
    that.getLength = getLength;
    that.print = print;
    that.setStart = setStart;
    that.getDurations = getDurations;
    that.setDuration = setDuration;
    that.printTiming = printTiming;
    that.rep = rep;
    that.setAnims = setAnims;
    that.subset = subset;
    that.setSubset = setSubset;
    that.type = ["containerAnim", "anim"];

    return that;
};

// No params because this is a variadic function
var vec = function() {
    var args = _.toArray(arguments);
    var tail = _.last(args);
    // If this is an anim object it will have a "type"
    var allAnims = _.has(tail, "type");
    var anims, opts;
    if (allAnims) {
        anims = args;
        opts = {};
    } else {
        anims = _.initial(args);
        opts = tail;
    }
    opts = _.defaults(_.clone(opts), {
        start: 0,
        duration: null,
        label: "vec"
    });

    var start = opts.start;
    var duration = opts.duration;
    var label = opts.label;

    var getStart = function() {
        if (_.isArray(start) && _.size(start) > 1) {
            return 0;
        } else {
            return start;
        }
    };

    var getStarts = function() {
        var cumsum = function(x) {
            return _.reduce(x, function(acc, n) {
                acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n);
                return acc;
            }, []);
        };

        var ds = this.getDurations();
        var starts;
        if (! _.isArray(start) ||
            (_.isArray(start) && _.size(start) === 1)) {
            starts = cumsum(_.map(this.anims, function(a) {
                return a.getStart();
            })); 
        } else {
            starts = cumsum(start);
        }

        if (_.size(this.anims) > 1) {
            // Shift duration array right by 1 and set first value
            // to 0 then cumsum()
            var sums = cumsum([0].concat(_.initial(ds)));
            for (var i = 0; i < _.size(this.anims); i++) {
                sums[i] += starts[i];
            }
            return sums;
        } else {
            return starts;
        }
    };
    
    var getDuration = function() {
        if (_.isNull(duration) ||
            (_.isArray(duration) && _.size(duration) > 1)) {
            var ds = this.getDurations();
            var ss = this.getStarts();
            return _.last(ss) + _.last(ds);
        } else {
            return duration;
        }
    };

    var splice = function(values, opts) {
        opts = opts || {};
        opts = _.defaults(opts, {
            after: null,
            at: null
        });
        var after = opts.after;
        var at = opts.at;
        
        this.checkSpliceArgs(after, at);

        if (_.isNull(after) && _.isNull(at)) {
            after = this.getLength();
        }
        
        if (_.isNull(at)) {
            if (! _.contains(values.type, "vecAnim")) {
                if (_.contains(values.type, "atomicAnim") ||
                    _.contains(values.type, "vecAnim")) {
                    values = vec.call(null, values);
                } else {
                    throw new Error("Invalid value to splice");
                }
            }
            this.appendAnim(values, after);
        } else {
            if (at === 0) {
                return trac.call(null, values, this);
            } else {
                var firstInds = [];
                for (var i = 0; i < at; i++) {
                    firstInds.push(i);
                }
                var lastInds = [];
                for (var ii = at; ii < this.getLength(); ii++) {
                    lastInds.push(ii);
                }
                this.splice(this.subset(firstInds),
                            trac(values, this.subset(lastInds)));
            }
        }
    };

    var toString = function() {
        var animChar = _.map(this.anims, function(a) {
            return a.toString();
        });
        // Fill each list out with blanks
        var maxLength = _.max(_.map(animChar, _.size));
        var animFull = _.map(animChar, function (x) {
            if (_.size(x) < maxLength) {
                x = [x];
                for (var i = 0; i < (maxLength - _.size(x)); i++) {
                    x.push("");
                }
            }
            return x;
        });
        return animFull.join("|");
    };

    var timing = function(opts) {
        var that = this;
        opts = opts || {};
        opts = _.defaults(opts, {
            s: that.getStart(),
            d: that.getDuration(),
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });

        var ss = that.getStarts();
        var ds = that.getDurations();
        var nAnim = that.getLength();
        var timings = [];

        for (var i = 0; i < nAnim; i++) {
            var tmpopts = _.clone(opts);
            // _.clone doesn't *deep* clone...
            // so lets *really* clone everything
            tmpopts.vec = _.clone(opts.vec);
            tmpopts.vecNum = _.clone(opts.vecNum);
            tmpopts.trac = _.clone(opts.trac);
            tmpopts.tracNum = _.clone(opts.tracNum);

            tmpopts.s = ss[i];
            tmpopts.d = ds[i];
            if (_.isNull(tmpopts.vec)) {
                tmpopts.vec = [that.label];
            } else if (_.isArray(tmpopts.vec)) {
                tmpopts.vec.push(that.label);
            }
            if (_.isNull(tmpopts.vecNum)) {
                tmpopts.vecNum = [i];
            } else if (_.isArray(tmpopts.vecNum)) {
                tmpopts.vecNum.push(i);
            }
            tmpopts.offset += opts.s;
            timings.push(that.anims[i].timing(tmpopts));
        }

        return timings;
    };

    var that = new container(anims, opts);

    that.getStart = getStart;
    that.getStarts = getStarts;
    that.getDuration = getDuration;
    that.timing = timing;
    that.toString = toString;
    that.splice = splice;
    that.type = ["vecAnim"].concat(that.type);

    return that;
};

// No params because this is a variadic function
var trac = function() {
    var args = _.toArray(arguments);
    var tail = _.last(args);
    // If this is an anim object it will have a "type"
    var allAnims = _.has(tail, "type");
    var anims, opts;
    if (allAnims) {
        anims = args;
        opts = {};
    } else {
        anims = _.initial(args);
        opts = tail;
    }
    opts = _.defaults(_.clone(opts), {
        start: 0,
        duration: null,
        label: "trac"
    });

    var start = opts.start;
    var duration = opts.duration;
    var label = opts.label;

    var getStart = function() {
        if (_.isArray(start) && _.size(start) > 1) {
            return 0;
        } else {
            return start;
        }
    };

    var getStarts = function() {
        if (_.isNumber(start) ||
            (_.isArray(start) && _.size(start) === 1)) {
            return _.map(this.anims, function(a) {
                return a.getStart();
            });
        } else {
            return start;
        }
    };

    var getDuration = function() {
        if (_.isNull(duration) ||
            (_.isArray(duration) && _.size(duration) > 1)) {
            var ds = this.getDurations();
            var ss = this.getStarts();
            var sums = [];
            for (var i = 0; i < ds.length; i++) {
                sums.push(ds[i] + ss[i]);
            }
            return _.max(sums);
        } else {
            return duration;
        }
    };
    
    var splice = function(values, opts) {
        opts = opts || {};
        opts = _.defaults(opts, {
            after: null,
            at: null
        });
        var after = opts.after;
        var at = opts.at;
        
        this.checkSpliceArgs(after, at);
        
        if (_.isNull(at)) {
            if (! _.contains(values.type, "tracAnim")) {
                if (_.contains(values.type, "atomicAnim") ||
                    _.contains(values.type, "vecAnim")) {
                    values <- new trac.apply(null, values);
                } else {
                    throw new Error("Invalid value to splice");
                }
            }
            this.appendAnim(values, after);
        } else {
            if (at === 1) {
                return new vec.apply(null, values.concat(this));
            } else {
                this.splice();
            }
        }
    };

    var timing = function(opts) {
        var that = this;
        opts = opts || {};
        opts = _.defaults(opts, {
            s: that.getStart(),
            d: that.getDuration(),
            lab: that.label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });

        var ss = that.getStarts();
        var ds = that.getDurations();
        var nAnim = that.getLength();
        var timings = [];

        for (var i = 0; i < nAnim; i++) {
            var tmpopts = _.clone(opts);
            // _.clone doesn't *deep* clone...
            // so lets *really* clone everything
            tmpopts.vec = _.clone(opts.vec);
            tmpopts.vecNum = _.clone(opts.vecNum);
            tmpopts.trac = _.clone(opts.trac);
            tmpopts.tracNum = _.clone(opts.tracNum);

            tmpopts.s = ss[i];
            tmpopts.d = ds[i];
            if (_.isNull(tmpopts.trac)) {
                tmpopts.trac = [that.label];
            } else if (_.isArray(tmpopts.trac)) {
                tmpopts.trac.push(that.label);
            }
            if (_.isNull(tmpopts.tracNum)) {
                tmpopts.tracNum = [i];
            } else if (_.isArray(tmpopts.tracNum)) {
                tmpopts.tracNum.push(i);
            }
            tmpopts.offset += opts.s;
            timings.push(that.anims[i].timing(tmpopts));
        }

        return timings;
    };

    var toString = function() {
        return _.map(this.anims, function(a) {
            return a.toString();   
        }).join(", ");
    };

    var that = new container(anims, opts);

    that.getStart = getStart;
    that.getStarts = getStarts;
    that.getDuration = getDuration;
    that.timing = timing;
    that.toString = toString;
    that.splice = splice;
    that.type = ["tracAnim"].concat(that.type);

    return that;
};

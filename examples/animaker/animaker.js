var anim = function() {
    var getLength = function() {
        return 1;
    };

    var rep = function() {
        // TODO: Implement rep().
        //       Is this a good idea? Should we leave this up to the
        //       user? Probably. Recycling rule doesn't apply in JS.
        // args: x, ..., vec = TRUE
        // if (vec) {
        //     do.call("vec", rep(list(x), ...))
        // } else {
        //     do.call("trac", rep(list(x), ...)) 
        // }
    };

    var print = function() {
        console.log(this.toString());   
    };

    var getWidths = function(cw) {
        widths = _.clone(cw) || [0, 0, 0, 0, 0, 0, 0];
        var timings = this.timing();
        _.each(timings, function(t) {
            if (_.contains(t.type, "atomicAnim")) {
                widths[0] = Math.max(t.label.length, widths[0]);
                widths[1] = Math.max(t.start.toString().length, widths[1]);
                widths[2] = Math.max(t.duration.toString().length, widths[2]);

                // The following *may* be vectors (or null)
                widths[3] = Math.max(widths[3],
                                     _.isNull(t.vec) ? 0 : t.vec.join(":").length); 
                widths[4] = Math.max(widths[4],
                                     _.isNull(t.vecNum) ? 0 : t.vecNum.join(":").length); 
                widths[5] = Math.max(widths[5],
                                     _.isNull(t.trac) ? 0 : t.trac.join(":").length); 
                widths[6] = Math.max(widths[6],
                                     _.isNull(t.tracNum) ? 0 : t.tracNum.join(":").length); 
            } else {
                widths = t.getWidths(widths);
            }
        });
        return widths;
    };

    var formatTiming = function(val, width) {
        var sep = " ";
        var pad = function(p) {
            var tmp = "";
            for (var i = 0; i < p; i++) {
                tmp += sep;
            }
            return tmp;
        };

        if (_.isArray(val)) {
            val = val.join(":");
        }
        if (_.isNull(val) || _.isUndefined(val)) {
            val = "";
        }
        return val + pad(width - val.toString().length);
    };

    return {
        getLength: getLength,
        rep: rep,
        print: print,
        getWidths: getWidths,
        formatTiming: formatTiming,
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

    var timingInfo = function(opts) {
        var lab = this.label;
        opts = opts || {};
        opts = _.defaults(opts, {
            s: getStart(),
            d: getDuration(),
            lab: this.lab,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null
        });

        var print = function() {
            var that = this;
            var stringVal = function(val) {
                if (_.isNull(val)) {
                    return "N/A";
                } else if (_.isArray(val)) {
                    return val.join(":");
                } else {
                    return val.toString();
                }
            };
            var v = stringVal(that.vec);
            var vNum = stringVal(that.vecNum);
            var t = stringVal(that.trac);    
            var tNum = stringVal(that.tracNum);
            return that.label + ", " +
                   that.start + ", " +
                   that.duration + ", " +
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
        opts = opts || {};
        opts = _.defaults(opts, {
            s: getStart(),
            d: getDuration(),
            lab: label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });
        // Apply offset, then remove
        opts.s = opts.offset + opts.s;
        opts = _.omit(opts, "offset");

        return timingInfo(opts);
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
        return _.size(anims);
    };

    var print = function() {
        return _.map(anims, function(a) {
            return a.toString();
        });
    };

    var setStart = function(value) {
        start = value;
        validateContainer(anims, start, duration);
    };

    var setDuration = function(value) {
        duration = value;
        validateContainer(anims, start, duration);
    };

    var getDurations = function() {
        if (_.isNull(duration) || _.isNumber(duration)) {
            return _.map(anims, function(a) {
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

    var __setAnimIndex = function(index) {
        index = _.toArray(index);
        var tmpAnims = [];
        for (var i = 0; i < _.size(index); i++) {
            tmpAnims.push(anims[index[i]]);
        }
        anims = tmpAnims;
    };

    var getSubset = function(index, list) {
        index = _.toArray(index);
        list = list || false;
        if (list) {
            var sub = _.clone(this);
            sub.__setAnimIndex(index);
            return sub;
        } else {
            var sub = [];
            for (var i = 0; i < _.size(index); i++) {
                sub.push(anims[index[i]]);
            }
            if (_.size(index) === 1) {
                return sub[0];
            } else {
                return sub;
            }
        }
    };

    var setSubset = function(value, index, list) {
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

        index = _.toArray(index);
        list = list || false;
        if (list) {
            if (! _.contains(value.type, "anim")) {
                throw new Error("Invalid value to assign");
            }
            for (var i = 0; i < _.size(index); i++) {
                anims[index[i]] = value[i];
            }
            return;
        } else {
            // Need to assign and validate
            for (var i = 0; i < _.size(index); i++) {
                anims[index[i]] = value.anims[i];
            }
            if (_.size(start) > 1) {
                if (_.size(value.start) > 1) {
                    for (i = 0; i < _.size(index); i++) {
                        start[index[i]] = value.start[i];
                    }
                } else {
                    var calcStarts = _.map(value.anims, function(a) {
                        return a.getStart();    
                    });
                    for (i = 0; i < _.size(index); i++) {
                        start[index[i]] = calcStarts[i];
                    }
                }
            } else {
                if (_.size(value.start) > 1) {
                    console.warning("Dropping start information on assignment");
                }
            }
            if (! _.isNull(duration) &&
                _.size(duration) > 1) {
                if (! _.isNull(value.duration) &&
                    _.size(value.duration) > 1) {
                    duration[index[i]] = value.duration[i];
                } else {
                    var calcDurations = _.map(value.anims, function(a) {
                        return a.getDuration();    
                    });
                    for (i = 0; i < _.size(index); i++) {
                        duration[index[i]] = calcDurations[i];
                    }
                }
            } else {
                if (! _.isNull(value.duration) &&
                    _.size(value.duration) > 1) {
                    console.warning("Dropping duration information on assignment");
                }
            }
            return;
        }
    };

    var that = new anim();
    that.anims;
    that.start = start;
    that.duration = duration;
    that.label = label;
    that.validateContainer = validateContainer;
    that.getLength = getLength;
    that.print = print;
    that.setStart = setStart;
    that.getDurations = getDurations;
    that.setDuration = setDuration;
    that.printTiming = printTiming;
    that.__setAnimIndex = __setAnimIndex;
    that.getSubset = getSubset;
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
            starts = cumsum(_.map(anims, function(a) {
                return a.getStart();
            })); 
        } else {
            starts = cumsum(start);
        }

        if (_.size(anims) > 1) {
            // Shift duration array right by 1 and set first value
            // to 0 then cumsum()
            var sums = cumsum([0].concat(_.initial(ds)));
            for (var i = 0; i < _.size(anims); i++) {
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

    var toString = function() {
        var animChar = _.map(anims, function(a) {
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
        opts = opts || {};
        opts = _.defaults(opts, {
            s: this.getStart(),
            d: this.getDuration(),
            lab: label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });

        var ss = this.getStarts();
        var ds = this.getDurations();
        var nAnim = this.getLength();
        var timings = [];

        for (var i = 0; i < nAnim; i++) {
            var tmpopts = _.clone(opts);
            // _.clone doesn't *deep* clone...
            // so lets *really* clone everything
            tmpopts.vec = _.clone(opts.vec);
            tmpopts.vecNum = _.clone(opts.vecNum);
            tmpopts.trac = _.clone(opts.trac);
            tmpopts.tracNum = _.clone(opts.trac);

            tmpopts.s = ss[i];
            tmpopts.d = ds[i];
            if (_.isNull(tmpopts.vec)) {
                tmpopts.vec = [label];
            } else if (_.isArray(tmpopts.vec)) {
                tmpopts.vec.push(label);
            }
            if (_.isNull(tmpopts.vecNum)) {
                tmpopts.vecNum = [i];
            } else if (_.isArray(tmpopts.vecNum)) {
                tmpopts.vecNum.push(i);
            }
            tmpopts.offset += opts.s;
            timings.push(anims[i].timing(tmpopts));
        }

        return timings;
    };

    var that = new container(anims, opts);

    that.getStart = getStart;
    that.getStarts = getStarts;
    that.getDuration = getDuration;
    that.timing = timing;
    that.toString = toString;
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
            return _.map(anims, function(a) {
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

    var timing = function(opts) {
        opts = opts || {};
        opts = _.defaults(opts, {
            s: this.getStart(),
            d: this.getDuration(),
            lab: label,
            vec: null,
            vecNum: null,
            trac: null,
            tracNum: null,
            offset: 0
        });

        var ss = this.getStarts();
        var ds = this.getDurations();
        var nAnim = this.getLength();
        var timings = [];

        for (var i = 0; i < nAnim; i++) {
            var tmpopts = _.clone(opts);
            // _.clone doesn't *deep* clone...
            // so lets *really* clone everything
            tmpopts.vec = _.clone(opts.vec);
            tmpopts.vecNum = _.clone(opts.vecNum);
            tmpopts.trac = _.clone(opts.trac);
            tmpopts.tracNum = _.clone(opts.trac);

            tmpopts.s = ss[i];
            tmpopts.d = ds[i];
            if (_.isNull(tmpopts.trac)) {
                tmpopts.trac = [label];
            } else if (_.isArray(tmpopts.trac)) {
                tmpopts.trac.push(label);
            }
            if (_.isNull(tmpopts.tracNum)) {
                tmpopts.tracNum = [i];
            } else if (_.isArray(tmpopts.tracNum)) {
                tmpopts.tracNum.push(i);
            }
            tmpopts.offset += opts.s;
            timings.push(anims[i].timing(tmpopts));
        }

        return timings;
    };

    var toString = function() {
        return _.map(anims, function(a) {
            return a.toString();   
        }).join(", ");
    };

    var that = new container(anims, opts);

    that.getStart = getStart;
    that.getStarts = getStarts;
    that.getDuration = getDuration;
    that.timing = timing;
    that.toString = toString;
    that.type = ["tracAnim"].concat(that.type);

    return that;
};

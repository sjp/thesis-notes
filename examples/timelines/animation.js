var Animation = function(name, opts) {
    this.name = name;
    if (_.isUndefined(opts))
        opts = {};
    opts = _.defaults(opts, {
        duration: 0,
        delay: 0,
        action: null,
        iter: 1
    });

    var iter = opts.iter;
    var duration = opts.duration;
    var delay = opts.delay;
    var action = opts.action;

    // Let's check if these durations and start values are functions
    // based on an expected number of iterations
    // If iterations is greater than one, we need to create arrays too
    var i;
    if (_.isFunction(duration)) {
        duration = [];
        for (i = 0; i < iter; i++) {
            duration.push(opts.duration(i + 1));
        }
    }
    if (_.isFunction(delay)) {
        delay = [];
        for (i = 0; i < iter; i++) {
            delay.push(opts.delay(i + 1));
            // The delay now becomes the *real* delay for the given iteration
            // based on the current delay value, previous delay values and
            // the previous durations
            if (i > 0) {
                delay[i] += delay[i - 1];
                if (_.isArray(duration)) {
                    delay[i] += duration[i - 1];
                } else {
                    delay[i] += duration;
                }
            }
        }
    } else if (iter > 1) {
        delay = [];
        for (i = 0; i < iter; i++) {
            if (i > 0) {
                if (_.isArray(duration)) {
                    delay.push(delay[i - 1] + opts.delay + duration[i]);
                } else {
                    delay.push(delay[i - 1] + opts.delay + duration);
                }
            } else {
                delay.push(opts.delay);
            }
        }
    }

    var animPath = [];
    var childAnims = {};
    
    this.play = function(t, i) {
        // Give ourselves a reference to the current animation
        // for calling the action function (by default binds to
        // window).
        var obj = this;
        if (_.isUndefined(t))
            t = 0;
        if (_.isUndefined(i))
            i = 1;
        // Play *this* animation
        if (! _.isNull(action)) {
            if (iter === 1) {
                setTimeout((function() {
                    return function() {
                        action.call(obj, duration, 1);
                    };   
                })(), t + delay);
            } else {
                var result = [];
                for (var j = 0; j < iter; j++) {
                    result.push(j + 1);
                }
                _.each(result, function(i) {
                    var thisDuration, thisDelay;
                    if (_.isArray(duration)) {
                        thisDuration = duration[i - 1];
                    } else {
                        thisDuration = duration;
                    }
                    if (_.isArray(delay)) {
                        thisDelay = delay[i - 1];
                    } else {
                        thisDelay = delay;
                    }
                    setTimeout((function() {
                        return function() {
                            action.call(obj, thisDuration, i);
                        };
                    })(), t + thisDelay);
                });
            }
        }
        // Play *child* animations
        _.each(childAnims, function(anim) {
            if (iter === 1) {
                setTimeout((function() {
                    return function() {
                        anim.play(duration);
                    };   
                })(), t + delay);
            } else {
                var result = [];
                for (var j = 0; j < iter; j++) {
                    result.push(j + 1);
                }
                _.each(result, function(i) {
                    var thisDuration, thisDelay;
                    if (_.isArray(duration)) {
                        thisDuration = duration[i - 1];
                    } else {
                        thisDuration = duration;
                    }
                    if (_.isArray(delay)) {
                        thisDelay = delay[i - 1];
                    } else {
                        thisDelay = delay;
                    }
                    setTimeout((function() {
                        return function() {
                            anim.play(thisDuration);
                        };
                    })(), t + thisDelay);
                });
            }
        });
    };
    
    // OPTIONS:
    // 
    // - animPath
    this.addChild = function(anim, opts) {
        if (_.isUndefined(opts))
            opts = {};
        // __restAnimPath should be hidden
        // it's what keeps track of the current path as we descend the tree
        opts = _.defaults(opts, {animPath: [], __restAnimPath: []});
        if (! _.isEmpty(opts.__restAnimPath)) {
            // Adding to a child
            var currentName = opts.__restAnimPath.shift();
            if (_.has(childAnims, currentName)) {
                if (_.isEmpty(opts.__restAnimPath)) {
                    // Reducing to simple appending
                    childAnims[currentName].addChild(anim);
                } else {
                    childAnims[currentName].addChild(anim, opts);
                }
            } else {
                console.error("No such name %s in the path", currentName);
            }
        } else if (! _.isEmpty(opts.animPath)) {
            // Need to add to a child, descend
            var currentName = _.first(opts.animPath);
            opts.__restAnimPath = _.rest(opts.animPath);
            childAnims[currentName].addChild(anim, opts);
        } else {
            // Adding to *this node*
            anim.setAnimPath(_.clone(animPath));
            childAnims[anim.name] = anim;
        }
    };

    this.removeChild = function(path) {
        if ((_.isArray(path) && path.length === 1) ||
            _.isString(path)) {
            _.each(_.pick(childAnims, path), function(anim) {
                // Chop off the first and last elements of the animPath
                // First is because we're removing ourselves from this tree
                // Second is because when setting a path, the name gets added automatically
                // so avoid duplicating this
                anim.setAnimPath(_.initial(_.rest(anim.getAnimPath())));
            });
            childAnims = _.omit(childAnims, path);
        } else {
            if (! _.isEmpty(childAnims))
                childAnims[path[0]].removeChild(_.rest(path));
        }
    };

    this.concat = function() {
        if (length(arguments) === 0)
            return;
        _.each(arguments, function(anim) {
            anim.setAnimPath(animPath);
            childAnims[anim.name] = anim;
        });
    };

    this.getAnimPath = function() {
        return animPath;
    };

    this.setAnimPath = function(ap) {
        ap.push(this.name);
        animPath = ap;
        // Propogate the change to all children
        _.each(childAnims, function(anim) {
            anim.setAnimPath(_.clone(animPath));
        });
    };

    // Assume 'i' is indexed from 1
    this.getDelay = function(i) {
        //console.log(i);
        //console.log(delay);
        if (! _.isArray(delay)) {
            return i * delay;
        }
        return delay[i - 1];
    };

    this.getDuration = function() {
        if (_.isEmpty(childAnims))
            return delay + duration;
        var durations = _.map(childAnims, function(anim) {
            return anim.getDuration(); 
        });
        var maxChildDuration = _.max(durations);
        return delay + duration + maxChildDuration;
    };

    // This gives us a nice way of looking at the structure of the animation
    // tree when printing to the console or alerting or whatever.
    this.toString = function(indent) {
        var output;
        if (_.isUndefined(indent)) {
            output = this.name + "[" + delay + ", " + duration + "]";
            if (! _.isEmpty(childAnims)) {
                var childStrings = _.map(childAnims, function(anim, key) {
                    return "\n" + anim.toString.call(anim, "  "); // indent size!
                });
                output = _.reduce(childStrings, function(output, s) {
                    return output + s;
                }, output);
            }
            return output;
        } else {
            output = indent + this.name + "[" + delay + ", " + duration + "]";
            if (! _.isEmpty(childAnims)) {
                var childStrings = _.map(childAnims, function(anim, key) {
                    return "\n" + anim.toString.call(anim, "  " + indent); // indent size!
                });
                output = _.reduce(childStrings, function(output, s) {
                    return output + s; 
                }, output);
            }
            return output;
        }
    };
};


// An Animation has four core properties:
// 
// 1. Name - A simple identifier for the animation
// 2. Duration - The length of time that a function is to be called
// 3. Delay - The waiting time until a function is called
// 4. Action - The function to call at a specified time
//
// We want these to be stored in a *tree*.
// This means that each animation may have children and animations itself

var a = new atomic({label: "a", duration: 1});
var b = new atomic({label: "b", duration: 2});
var c = new atomic({label: "c", duration: 3});

var v = new vec(a, b, c);

var t = new trac(a, b, c);

var aContainer = new vec(t, v, {label: "cont"});

var vDelay = new vec(a, b, c, {start: 1});

var vDurn = new vec(a, b, c, {start: 1, duration: 10});

var d = new atomic({start: 0.5, duration: 2});
var vContentDelay = new vec(a, b, c, d);

var tContentDelay = new trac(a, d);

var vParentDelay = new vec(a, b, c, {start: [0, 0.5, 0.5]});

var tParentDelay = new trac(a, b, c, {start: [0, 0.5, 1]});


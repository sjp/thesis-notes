if (!(Modernizr.svg && Modernizr.inlinesvg)) {
    var p = document.createElement("p");
    var firsth2 = document.getElementsByTagName("h2")[0];
    p.className = 'warning';
    p.innerHTML = '<strong>Warning:<\/strong> Your browser does not appear to support SVG. As a result, this article may not appear as intended. The latest versions of <a href="http://www.google.com/chrome">Google Chrome<\/a>, <a href="http://www.mozilla.org/firefox/">Mozilla Firefox<\/a> or <a href="http://www.opera.com/browser/">Opera<\/a> support SVG.';
    firsth2.parentNode.insertBefore(p, firsth2);
}

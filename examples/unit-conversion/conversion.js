// Note that this code is documented using JSDoc and guided by the following URLs:
// http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
// https://developers.google.com/closure/compiler/docs/js-for-compiler

// NOTE: The following code assumes that a global object, "gridSVGCoords"
//       is available. In other words, to use this code, load this object first.

/**
 * Returns a unit's x location relative to a viewport, in absolute SVG pixels.
 *
 * @param {string} vpname The name of the viewport that the unit is drawn within
 * @param {number} x The size of the unit, based on 'from'
 * @param {string} from The input unit type
 * @returns {number} A unit in SVG pixels
 */
var viewportConvertX = function(vpname, x, from) {
    var offset = gridSVGCoords[vpname].x;
    var width = viewportConvertWidth(vpname, x, from, "svg");
    return offset + width;
};

/**
 * Returns a unit's y location relative to a viewport, in absolute SVG pixels.
 *
 * @param {string} vpname The name of the viewport that the unit is drawn within
 * @param {number} x The size of the unit, based on 'from'
 * @param {string} from The input unit type
 * @returns {number} A unit in SVG pixels
 */
var viewportConvertY = function(vpname, x, from) {
    var offset = gridSVGCoords[vpname].y;
    var height = viewportConvertHeight(vpname, x, from, "svg");
    return offset + height;
};

/**
 * Converts from any unit to any other unit along the horizontal dimension, relative to a viewport.
 *
 * @param {string} vpname The name of the viewport that the unit is drawn within
 * @param {number} x The size of the unit, based on 'from'
 * @param {string} from The input unit type
 * @param {string} to The output unit type
 * @returns {number} A unit in SVG pixels
 */
var viewportConvertWidth = function(vpname, x, from, to) {
    var vpCoords = gridSVGCoords[vpname];
    var i = toInches(from, x,
                     vpCoords.width,
                     vpCoords.xscale,
                     vpCoords.inch);
    var u = toUnit(to, i,
                   vpCoords.width,
                   vpCoords.xscale,
                   vpCoords.inch);
    return roundNumber(u, 2);
};

/**
 * Converts from any unit to any other unit along the vertical dimension, relative to a viewport.
 *
 * @param {string} vpname The name of the viewport that the unit is drawn within
 * @param {number} x The size of the unit, based on 'from'
 * @param {string} from The input unit type
 * @param {string} to The output unit type
 * @returns {number} A unit in SVG pixels
 */
var viewportConvertHeight = function(vpname, x, from, to) {
    var vpCoords = gridSVGCoords[vpname];
    var i = toInches(from, x,
                     vpCoords.height,
                     vpCoords.yscale,
                     vpCoords.inch);
    var u = toUnit(to, i,
                   vpCoords.height,
                   vpCoords.yscale,
                   vpCoords.inch);
    return roundNumber(u, 2);
};

/**
 * Converts from any unit to what R thought were inches.
 *
 * @param {string} from The input unit type
 * @param {number} unitValue The size of the unit, based on 'from'
 * @param {number} vpDimSize The size of the viewport that the unit belongs in, in SVG pixels
 * @param {Array.<number>} nativeScale For the given dimension that we're converting along (x or y)
 * @param {number} dimInchSize The size of an inch along this dimension
 * @returns {number} The input unit in inches
 */
var toInches = function(from, unitValue, vpDimSize, nativeScale, dimInchSize) {
    var nativeToInches = function(nativeValue, nativeScale, vpDimSize, dimInchSize) {
        var dist = nativeValue - nativeScale[0];
        var nativeUnitSize = vpDimSize / Math.abs(nativeScale[1] - nativeScale[0]);
        return dist * nativeUnitSize / dimInchSize;
    };
    
    var npcToInches = function(npcValue, vpDimSize, dimInchSize) {
        return (npcValue * vpDimSize) / dimInchSize;
    };

    var result;
    switch (from) {
        case "native":
            result = nativeToInches(unitValue, nativeScale, vpDimSize, dimInchSize);
            break;
        case "npc":
            result = npcToInches(unitValue, vpDimSize, dimInchSize);
            break;
        case "inches":
            result = unitValue;
            break;
        case "cm":
            result = unitValue / 2.54;
            break;
        case "mm":
            result = unitValue / 25.4;
            break;
        case "points":
            result = unitValue / 72.27;
            break;
        case "picas":
            result = (unitValue * 12) / 72.27;
            break;
        case "bigpts":
            result = unitValue / 72;
            break;
        case "dida":
            result = unitValue / 1157 * 1238 / 72.27;
            break;
        case "cicero":
            result = unitValue * 12 / 1157 * 1238 / 72.27;
            break;
        case "scaledpts":
            result = unitValue / 65536 / 72.27;
            break;
        case "svg":
            result = unitValue / dimInchSize;
            break;
        default:
            console.error('Unsupported "from" unit: [%s]', from);
    }
    return result;
};

/**
 * Converts from what R thought were inches, to another unit.
 *
 * @param {string} to The desired output unit
 * @param {number} unitValue The source size in inches to be converted to another unit
 * @param {number} vpDimSize The size of the viewport that the unit belongs in, in SVG pixels
 * @param {Array.<number>} nativeScale For the given dimension that we're converting along (x or y)
 * @param {number} dimInchSize The size of an inch along this dimension
 * @returns {number} The input unit in 'to' units
 */
var toUnit = function(to, unitValue, vpDimSize, nativeScale, dimInchSize) {
    var inchesToNative = function(inchesValue, nativeScale, vpDimSize, dimInchSize) {
        var npc = (inchesValue * dimInchSize) / vpDimSize;
        var vpRange = nativeScale[1] - nativeScale[0];
        return (npc * vpRange) + nativeScale[0];
    };
    
    var inchesToNpc = function(inchesValue, vpDimSize, dimInchSize) {
        return (inchesValue * dimInchSize) / vpDimSize;
    };

    var result;
    switch (to) {
        case "native":
            result = inchesToNative(unitValue, nativeScale, vpDimSize, dimInchSize);
            break;
        case "npc":
            result = inchesToNpc(unitValue, vpDimSize, dimInchSize);
            break;
        case "inches":
            result = unitValue;
            break;
        case "cm":
            result = unitValue * 2.54;
            break;
        case "mm":
            result = unitValue * 25.4;
            break;
        case "points":
            result = unitValue * 72.27;
            break;
        case "picas":
            result = (unitValue / 12) * 72.27;
            break;
        case "bigpts":
            result = unitValue * 72;
            break;
        case "dida":
            result = unitValue * 1157 / 1238 * 72.27;
            break;
        case "cicero":
            result = unitValue / 12 * 1157 / 1238 * 72.27;
            break;
        case "scaledpts":
            result = unitValue * 65536 * 72.27;
            break;
        case "svg":
            result = unitValue * dimInchSize;
            break;
        default:
            console.error('Unsupported "to" unit: [%s]', to);
    }
    return result;
};

/**
 * Rounds a number to a specified amount of decimal places
 *
 * @param {number} number The input number to round
 * @param {number} digits The number of decimal places to round to
 * @returns {number} The rounded number
 */
var roundNumber = function(number, digits) {
    var multiple = Math.pow(10, digits);
    var rounded = Math.round(number * multiple) / multiple;
    return rounded;
};

/**
 * Returns the name of the viewport that a grob belongs to.
 *
 * Note that this is going to find the first matching viewport name from
 * the list of element IDs up the tree. It may end up incorrectly returning
 * a grob name instead of a viewport name in the case where a grob has the
 * same name as a viewport.
 *
 * @param {string} grobName The name of a grob
 * @returns {string} The name of the viewport that the grob belongs to
 */
var grobViewport = function(grobName) {
    var grob = document.getElementById(grobName);
    if (grob) {
        var foundViewport = false;
        var viewportName;
        var grobParent = grob.parentNode;
        while (! foundViewport) {
            var vpName = grob.getAttribute("id");
            var testVP = gridSVGCoords[vpName];
            // If we have found a match in our VP coordinate list
            // we have a candidate viewport, but a grob might have
            // the same name as a viewport... 
            if (testVP) {
                viewportName = vpName;
                foundViewport = true;
            } else {
                grob = grobParent;
                grobParent = grob.parentNode;
            }
        }
        return viewportName;
    } else {
        console.error("Unable to find grob [%s]", grobName);
    }
};

/**
 * Removes any empty text nodes from an XML tree.
 *
 * Often when we create XML, we use indentation to make the structure of
 * the XML document more obvious to someone who reads it.
 *
 * This is a good idea in general, but it makes parsing the DOM a bit
 * more challenging. Consider the following example:
 *
 * : <svg>
 * :     <rect ... />
 * : </svg>
 *
 * We would expect the <svg> node to have one child, when it in fact has
 * *three* child nodes. A text node, a rect node and a text node. This
 * goes against intuition so we would ideally like it so that only the 
 * nodes that contain elements, such as the rect node, remain. This is
 * the purpose of this function.
 * 
 * @param {Object} node An XML tree that we wish to prune
 */
var pruneTextNodes = function(node) {
    var blank = /^\s*$/;
    var child, next;
    switch (node.nodeType) {
        case 3: // Text node
            if (blank.test(node.nodeValue)) {
                node.parentNode.removeChild(node);
            }
            break;
        case 1: // Element node
        case 9: // Document node
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                pruneTextNodes(child);
                child = next;
            }
            break;
    }
};


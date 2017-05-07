/* 
 * EasyRad
 *
 * This program allows to edit MRRT templates and copy the result into the clipboard.
 * 
 * Copyright (C) 2017  IFTM Institut für Telematik in der Medizin GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @version 1.1
 * @author T. Hacklaender
 * @date 2017-05-07
 */


/**
 * Convert the content of the HTML root element to formatted TEXT.
 * 
 * @param {type} htmlElm The root element of the JQuery HTML DOM.
 * @returns the formatted text.
 */
function convert(htmlElm) {
    var text;

    //console.log(htmlElm.prop('nodeName')); // -> HTML

    text = mrrt2text(htmlElm);
    //text = html2text(htmlElm);
    //text = jQueryHtml2text(htmlElm);

    // Allow max 1 blank line between text
    text = text.replace(/\n{3,}/g, '\n\n');

    // Allow 1 space between text
    text = text.replace(/ {1,}/g, ' ');

    // Replace space followed by period by period only
    text = text.replace(/ \./g, '.');

    return text;
}

/*
 * Javascript function that convert HTML to plain text:
 * https://www.snip2code.com/Snippet/20372/Javascript-function-that-convert-HTML-to
 */
function html2text(htmlElm) {
    var html = htmlElm.html();
    var tag = document.createElement('div');
    tag.innerHTML = html;

    return tag.innerText;
}

function jQueryHtml2text(htmlElm) {
    var html = htmlElm.html();
    // Create a new jQuery object out of body text and remove desired elements
    var text = $(html).remove("script,noscript,style,:hidden").text();

    return text;
}

/**
 * 
 * @param {type} htmlElm
 * @returns {String}
 */
function mrrt2text(htmlElm) {
    // Get the native DOM element from the JQuery element
    var domElement = htmlElm[0];

    // Process the HTML DOM
    return walk(domElement, "");
}

/**
 * 
 * @param {type} node
 * @param {type} text
 * @returns {String}
 */
function walk(node, text) {
    var i;
    var childNodes;
    var childNode;

    childNodes = node.childNodes;
    if (childNodes == null) {
        return text;
    }

    for (i = 0; i < childNodes.length; i++) {
        childNode = childNodes[i];

        //console.log(childNode.nodeType);
        //console.log(childNode.nodeName);
        //console.log(childNode.nodeValue);
        //console.log("\n");

        switch (childNode.nodeType) {
            case Node.ELEMENT_NODE:
                text = processElementNode(childNode, text);
                break;

            case Node.TEXT_NODE:
                text = processTextNode(childNode, text);
                // Text nodes have no children. Therefore no recursion neccessary
                break;

            case Node.ATTRIBUTE_NODE:
                // Attributes are processed in element
                text = walk(childNode, text);
                break;

            case Node.CDATA_SECTION_NODE:
            case Node.ENTITY_REFERENCE_NODE:
            case Node.ENTITY_NODE:
            case Node.PROCESSING_INSTRUCTION_NODE:
            case Node.COMMENT_NODE:
            case Node.DOCUMENT_NODE:
            case Node.DOCUMENT_TYPE_NODE:
            case Node.DOCUMENT_FRAGMENT_NODE:
            case Node.NOTATION_NODE:
                text = walk(childNode, text);
                break;

            default:
                text += "\n" + "[Error: Unknown node type = " + childNode.nodeType + "]" + "\n";
                text = walk(childNode, text);
        }
    }
    return text;
}


/**
 * 
 * @param Element elm
 */
function processElementNode(elm, text) {
    var parentElm;
    var labelText;
    var elmValue;

    // Do not process 'disabled' or 'hidden' elements and their chidren
    if (elm.hasAttribute("disabled") || elm.hasAttribute("hidden")) {
        return text;
    }

    // Should not be used: CSS hiding of elements
    if (elm.style.display === 'none') {
        return text;
    }
    if (elm.style.visibility === 'hidden') {
        return text;
    }

    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

    // Get the optional label text
    labelText = getElmLabelText(elm);

    // Get the value of the element
    elmValue = getElmValue(elm);

    switch (elm.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":
            // Ignore elements and teire children
            break;

            /* ==== MRRT specific structural tags ==== */

        case "TITLE":
        case "EMBED":
            text = walk(elm, text);
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walk(elm, text);
            break;

        case "HEADER":  // SECTION header
            text = walk(elm, text);
            // Finish previous line and append blank line
            text += "\n\n";
            break;

        case "SELECT":  // A form to collect user input
            if (elmValue.length > 0) {
                if (labelText.length > 0) {
                    text += labelText + " ";
                }
                text += elmValue + " ";
            }
            text = walk(elm, text);
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONS are evaluated in getElmValue() for SELECT element
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            text = walk(elm, text);
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            text = walk(elm, text);
            switch (elm.type) {
                case 'text':
                case 'number':
                case 'date':
                case 'time':
                    if (elm.value.length > 0) {
                        if (labelText.length > 0) {
                            text += labelText + " ";
                        }
                        text += getElmValue(elm) + " ";
                    }
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        if (labelText.length > 0) {
                            text += labelText + " ";
                        }
                        text += getElmValue(elm) + " ";
                    }
                    break;

                case 'textarea':
                    if (elm.value.length > 0) {
                        if (labelText.length > 0) {
                            text += labelText + " ";
                        }
                        text += getElmValue(elm);
                        // Finish the line
                        text += "\n";
                    }
                    break;

                default:
                    text += "\n" + "[Error: Attribute not supported in INPUT: " + elm.type + "]" + "\n";
            }
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "A":	// Hyperlink
            text += "[" + elm.href + "] ";
            text = walk(elm, text);
            text += " ";
            break;

        case "BR":	// Line break
            text = walk(elm, text);
            text += "\n";
            break;

        case "IMG":	// Image
            text += "[" + elm.src + ", " + elm.alt + "] ";
            text = walk(elm, text);
            text += " ";
            break;

        case "LI":	// List item
            switch (parentElm.nodeName) {
                case "UL":
                    text += "- ";
                    break;

                case "OL":
                    text += "x. ";
                    break;

                default:
                    text += "? ";
            }
            text = walk(elm, text);
            text += "\n";
            break;

        case "OL":	// Ordered list
        case "UL":	// Unordered list
            text += "\n";
            text = walk(elm, text);
            break;

        case "P":	// Paragraph
            text = walk(elm, text);
            text += "\n\n";
            break;

        case "Q":	// Short quotation
            text += '"';
            text = walk(elm, text);
            text += '" ';
            break;

        case "TABLE":	// Defines a table
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walk(elm, text);
            text += "\n\n";
            break;

        case "TD":	// Table cell
        case "TH":	// Header cell in a table
            text = walk(elm, text);
            text += "\t";
            break;

        case "TR":	// Table row
            text = walk(elm, text);
            text += "\n";
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            text = walk(elm, text);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            text = walk(elm, text);
            break;

            /* ==== Elements not supported by MRRT ==== */

        case "TEXTAREA":
            // Finish previous line
            text += "\n";
            // Ignore the child TEXT node: It is already value of the element
            if (elm.value.length > 0) {
                if (labelText.length > 0) {
                    text += labelText + " ";
                }
                text += getElmValue(elm);
                // Finish the line
                text += "\n";
            }
            break;

        default:
            text += "\n" + "[Error: Element not allowed in MRRT: " + elm.nodeName + "]" + "\n";
    }

    return text;
}


/**
 * 
 * @param {type} textNode
 * @param {type} text
 * @returns {unresolved}
 */
function processTextNode(textNode, text) {
    // Get the text of the node
    var nodeText = textNode.nodeValue;

    // Ignore text with white spaces only
    if (nodeText.replace(/\s/g, '').length == 0) {
        return text;
    }
    // Remove leading and trailing white spaces
    nodeText = nodeText.trim();

    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = textNode.parentElement;
    var parentElm = textNode.parentNode;

    if (parentElm == null) {
        text += "\n" + "[Error: Text node has no parent element: " + nodeText + "]" + "\n";
        return text;
    }

    switch (parentElm.nodeName) {
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // LABEL text is evaluated in getElmLabelText()
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONs are evaluated in getElmValue() for SELECT element
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            // Text of INPUTs is evaluated in getElmValue()
            break;

        case "TEXTAREA":
            // Text of TEXTAREAs is evaluated in getElmValue()
            break;

        default:
            // By default append text of selected options only. Postfix with space.
            text += nodeText + " ";
    }

    return text;
}


/**
 * Gets the value of the element as a String.
 * 
 * @param Element elm The element to analyse
 * @returns String The value of the element. An empty string is returned, if no value
 *                 is specified.
 */
function getElmValue(elm) {
    var elmValue;
    var childElms;

    // By default the value is empty
    elmValue = '';

    switch (elm.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "HTML":
        case "HEAD":
        case "BODY":
        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":
            // No value
            break;

            /* ==== MRRT specific structural tags ==== */

        case "TITLE":
        case "EMBED":
            // No value
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
        case "HEADER":  // SECTION header
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // No value
            break;

        case "SELECT":  // A form to collect user input
            //  The value of the SELECT element is the text of the selected option(s)
            // Get all child elements (not nodes)
            childElms = elm.children;
            for (var i = 0; i < childElms.length; i++) {
                if (childElms[i].nodeName === "OPTION") {
                    if (childElms[i].selected) {
                        if (elmValue.length > 0) {
                            elmValue += OPTIONS_DELIMITER;
                        }
                        // MRRT specifies in 8.1.3.5.1 Selection Items, that the value of an OPTION is its value attribute, not the displayed text
                        // Text and content of value attribute must be the same according to MRRT!
                        elmValue += childElms[i].getAttribute("value");
                    }
                }
            }
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONS are evaluated by the "SELECT" element
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            switch (elm.type) {
                case 'text':
                case 'textarea':
                case 'number':
                case 'date':
                case 'time':
                    elmValue = elm.value;
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        elmValue = elm.value;
                    }
                    break;

                default:
                    elmValue = "\n" + "[Error: Attribute not supported in INPUT: " + elm.type + "]" + "\n";
            }
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "BR":	// Line break
        case "LI":	// List item
        case "OL":	// Ordered list
        case "P":	// Paragraph
        case "Q":	// Short quotation
        case "TABLE":	// Defines a table
        case "TR":	// Table row
        case "TD":	// Table cell
        case "TH":	// Header cell in a table
        case "UL":	// Unordered list
            // No value
            break;

        case "A":	// Hyperlink
            elmValue = "[" + elm.href + "]";
            break;

        case "IMG":	// Image
            elmValue = "[" + elm.src + ", " + elm.alt + "]";
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            // No value
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // No value
            break;

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            elmValue = elm.value;
            break;

        default:
            elmValue = "\n" + "[Error: Element not allowed in MRRT: " + elm.nodeName + "]" + "\n";
    }

    return elmValue;
}


/**
 * Gets the text of the <label> associated with an element.
 * 
 * NOTE: To allow processing of templates which are not strict conform to MRRT,
 * inline labels are processed here also.
 * For the strict rule see MRRT: 8.1.3.2 Linkage Between Template Text and Template Fields
 * 
 * @param Element elm The element to which the label should be searched
 * @returns String The text of the label. An empty string is returned, if no label
 *                 is specified.
 */
function getElmLabelText(elm) {
    var labelText;
    var parentElm;
    var labelElms;

    // By default the value is empty
    labelText = "";

    if (typeof elm === 'undefined') {
        return labelText;
    }

    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

    switch (parentElm.nodeName) {

        case "LABEL":
            // Inline labels are not specified in MRRT: 8.1.3.2 Linkage Between Template Text and Template Fields
            labelText += "[WARNING: Inline labels are not supported by MRRT] ";
            labelText += parentElm.textContent.trim();
            break;

        default:
            // Find label            
            labelElms = $(document).find("label[for='" + elm.id + "']");
            if (labelElms.length > 0) {
                labelText += labelElms.text().trim();
            }
    }

    // End the label with suffix
    if (!labelText.endsWith(LABEL_SUFFIX)) {
        labelText = labelText + LABEL_SUFFIX;
    }

    return labelText;
}
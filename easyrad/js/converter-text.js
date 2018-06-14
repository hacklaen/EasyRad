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
 * -----------------------------------------------------------------------------
 * 
 * This file contains the plain text converter for the templates.
 *  
 * @version 2.0.0
 * @author T. Hacklaender
 * @date 2018-06-11
 */


/**
 * Converts a completed template to plain text.
 * As inut this function expects the HTML output of function convertToHtml(),
 * which converts the completed form elements into span-elements. 
 * 
 * @param {Element} templateHtml the output of function convertToHtml().
 * @returns {String} the plain text representation of the completed template.
 */
function convertToText(templateHtml) {
    var text;

    //console.log(htmlElm.prop('nodeName')); // -> HTML

    text = mrrt2text(templateHtml);
    //text = html2text(templateHtml);
    //text = jQueryHtml2text(templateHtml);

    // Allow max 1 blank line between text
    text = text.replace(/\n{3,}/g, '\n\n');

    // Allow 1 space between text
    text = text.replace(/ {1,}/g, ' ');

    // Replace space followed by period by period only
    text = text.replace(/ \./g, '.');

    return text;
}

/**
 * Starting function for the recursiv walk throu the HTML DOM.
 * 
 * @param {Element} templateHtml the HTML DOM to process.
 * @returns {String} the plain text representation of the DOM.
 */
function mrrt2text(templateHtml) {
    // Process the HTML DOM
    return walkText(templateHtml, "");
}

/**
 * Recursively walks through the HTML DOM of the completed template.
 * 
 * @param {Node} nodeToProcess the next node to process.
 * @param {String} the plain text representation of the DOM as far as already 
 *                 processed. 
 * @returns {String} the plain text representation of the DOM after processing the
 *                   the given node.
 */
function walkText(nodeToProcess, text) {
    var i;
    var childNodes;
    var childNode;

    childNodes = nodeToProcess.childNodes;
    if (childNodes === null) {
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
                text = walkText(childNode, text);
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
                text = walkText(childNode, text);
                break;

            default:
                window.alert(i18n('err_unknown_node_type') + childNode.nodeType);
                // Ignore the unknown nodeToProcess and its children
        }
    }
    return text;
}


/**
 * Processes an element node.
 * 
 * @param {Element} elmToProcess the element to process.
 * @param {string} text the plain text representation of the DOM as far as already 
 *                 processed.
 * @returns {string} the plain text representation of the DOM after processing the
 *                   the given element.
 */
function processElementNode(elmToProcess, text) {
    var parentElm;
    var elmValue;

    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elmToProcess.parentElement;
    parentElm = elmToProcess.parentNode;
    if (parentElm === null) {
        return text;
    }

    // Get the value of the element
    elmValue = getElmValue(elmToProcess);

    switch (elmToProcess.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "SECTION":     // 8.1 Report Template Structure
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walkText(elmToProcess, text);
            break;

        case "HEADER":      // SECTION header
            text = walkText(elmToProcess, text);
            // Finish previous line and append blank line
            text += "\n\n";
            break;

        case "P":           // Paragraph
            text = walkText(elmToProcess, text);
            text += "\n\n";
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "DIV":         // Document division
            text = walkText(elmToProcess, text);
            text += "\n\n";
            break;

        case "A":           // Hyperlink
            text += "[" + elmToProcess.href + "] ";
            text = walkText(elmToProcess, text);
            text += " ";
            break;

        case "BR":          // Line break
            text = walkText(elmToProcess, text);
            text += "\n";
            break;

        case "IMG":         // Image
            text += "[" + elmToProcess.src + ", " + elmToProcess.alt + "] ";
            text = walkText(elmToProcess, text);
            text += " ";
            break;

        case "LI":          // List item
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
            text = walkText(elmToProcess, text);
            text += "\n";
            break;

        case "OL":          // Ordered list
        case "UL":          // Unordered list
            text += "\n";
            text = walkText(elmToProcess, text);
            break;

        case "Q":           // Short quotation
            text += '"';
            text = walkText(elmToProcess, text);
            text += '" ';
            break;

        case "TABLE":       // Defines a table
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walkText(elmToProcess, text);
            text += "\n\n";
            break;

        case "TD":          // Table cell
        case "TH":          // Header cell in a table
            text = walkText(elmToProcess, text);
            text += "\t";
            break;

        case "TR":          // Table row
            text = walkText(elmToProcess, text);
            text += "\n";
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            text = walkText(elmToProcess, text);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            text = walkText(elmToProcess, text);
            break;

            /* ==== Elements not supported by MRRT ==== */

        default:
            window.alert(i18n('err_element_ignored') + elmToProcess.nodeName);
    }

    return text;
}


/**
 * Processes a text-node.
 * 
 * @param {Node} textNodeToProcess the text-node to process
 * @param {string} text the plain text representation of the DOM as far as already 
 *                 processed.
 * @returns {string} the plain text representation of the DOM after processing the
 *                   the given element.
 */
function processTextNode(textNodeToProcess, text) {
    // Get the text of the node
    var nodeText = textNodeToProcess.nodeValue;

    // Ignore text with white spaces only
    if (nodeText.replace(/\s/g, '').length === 0) {
        return text;
    }
    // Remove leading and trailing white spaces
    nodeText = nodeText.trim();

    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = textNodeToProcess.parentElement;
    var parentElm = textNodeToProcess.parentNode;

    if (parentElm === null) {
        window.alert(i18n('err_text_has_no_parent') + nodeText);
        return text;
    }

    switch (parentElm.nodeName) {

        default:
            // By default append text of selected options only. Postfix with space.
            text += nodeText + " ";
    }

    return text;
}


/**
 * Gets the value of the element as a String.
 * 
 * @param {Element} elm the element to analyse.
 * @returns {String} the value of the element. An empty string is returned, if no value
 *                   is specified.
 */
function getElmValue(elm) {
    var elmValue;

    // By default the value is empty
    elmValue = '';

    switch (elm.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "SECTION":     // 8.1 Report Template Structure
        case "HEADER":      // SECTION header
        case "P":           // Paragraph
            // No value
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "DIV":	// NOT SPECIFIED IN MRRT. SHOULD BE REMOVED. Document division
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

        default:
        // Nothing to do: Warning ist given in processElementNode
    }

    return elmValue;
}


/*
 * Alternative function for mrrt2text:
 * Javascript function that convert HTML to plain text:
 * https://www.snip2code.com/Snippet/20372/Javascript-function-that-convert-HTML-to
 */
function html2text(templateHtml) {
    var tag = document.createElement('div');
    tag.innerHTML = templateHtml;

    return tag.innerText;
}


/*
 * Alternative function for mrrt2text:
 * jQuery function that convert HTML to plain text
 */
function jQueryHtml2text(templateHtml) {
    // Create a new jQuery object out of body text and remove desired elements
    var text = $(templateHtml).remove("script,noscript,style,:hidden").text();

    return text;
}
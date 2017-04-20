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
 * @version 1.0
 * @author T. Hacklaender
 * @date 2017-04-19
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
    var text;

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
    var str;
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
                // Do not process 'disabled' or 'hidden' elements and their chidren
                if (childNode.hasAttribute("disabled") || childNode.hasAttribute("hidden")) {
                    continue;
                }

                // Should not be used: CSS hiding of elements
                if (childNode.style.display === 'none') {
                    continue;
                }
                if (childNode.style.visibility === 'hidden') {
                    continue;
                }

                switch (childNode.nodeName) {
                    case "SCRIPT":
                    case "STYLE":
                    case "LINK":
                        // Ignore SCRIPT, STYLE and LINK tags and teire children
                        continue;

                    case "TEXTAREA":
                        text = preProcessElement(childNode, text);
                        // Ignore the child TEXT node: It is already value of the element
                        text = postProcessElement(childNode, text);
                        break;

                    case "LABEL":
                        // Ignore label nodes. They are handeled in preProcessElement and postProcessElement
                        var inputOrTextareaElements = $(childNode).find("input, textarea");
                        if (inputOrTextareaElements.length != 0) {
                            text = preProcessElement(inputOrTextareaElements[0], text);
                            // Ignore the child TEXT node: It is already value of the element
                            text = postProcessElement(inputOrTextareaElements[0], text);
                        }
                        continue;

                    default:
                        text = preProcessElement(childNode, text);
                        text = walk(childNode, text);
                        text = postProcessElement(childNode, text);
                }
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
 * Tries to find a label linked to the given element.
 * 
 * @param elm The element to which the label should be searched
 * @returns {window.$|$}
 */
function getLabelText(elm) {
    var labelText = null;
    var parentElm;
    var labelElms;

    // Get the parent element
    parentElm = elm.parentElement;

    switch (parentElm.nodeName) {

        case "LABEL":
            labelText = parentElm.innerText.trim();
            break;

        default:
            // Find label            
            labelElms = $(document).find("label[for='" + elm.id + "']");
            if (labelElms.length > 0) {
                labelText = labelElms.text();
            }
    }

    return labelText;
}

/**
 * 
 * @param {type} elm
 * @param {type} text
 * @returns {unresolved}
 */
function preProcessElement(elm, text) {
    var parentElm;
    var labelText;

    //console.log(elm.nodeName);

    // Get the parent element
    parentElm = elm.parentElement;
    // Get optional Labe text
    labelText = getLabelText(elm);

    switch (elm.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "HTML":
        case "HEAD":
        case "BODY":
        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":
            // Nothing to do
            break;

            /* ==== MRRT specific structural tags ==== */

        case "TITLE":
        case "EMBED":
            // Nothing to do
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
            // Finish previous line and append a blank line
            text += "\n\n";
            break;

        case "HEADER":  // SECTION header
        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
        case "SELECT":  // A form to collect user input
        case "OPTION":  // 8.1.3.5.1 Selection Items
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Nothing to do
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

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
            break;

        case "Q":	// Short quotation
            text += '"';
            break;

        case "TABLE":	// Defines a table
            // Finish previous line and append a blank line
            text += "\n\n";
            break;

        case "A":	// Hyperlink
        case "BR":	// Line break
        case "IMG":	// Image
        case "OL":	// Ordered list
        case "P":	// Paragraph
        case "TD":	// Table cell
        case "TH":	// Header cell in a table
        case "TR":	// Table row
        case "UL":	// Unordered list
            // Nothing to do
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            // Nothing to do
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Nothing to do
            break;

            /* ==== Elements not supported by MRRT ==== */

        case "TEXTAREA":
            // Finish previous line
            text += "\n";
            break;

        default:
            text += "\n" + "[Error: HTML element not allowed (preprocess): " + elm.nodeName + "]" + "\n";
    }

    return text;
}

/**
 * 
 * @param {type} elm
 * @param {type} text
 * @returns {unresolved}
 */
function postProcessElement(elm, text) {
    var parentElm;
    var labelText;

    //console.log(elm.nodeName);

    // Get the parent element
    parentElm = elm.parentElement;
    // Get optional Labe text
    labelText = getLabelText(elm);

    switch (elm.nodeName) {

        /* ==== General HTML structural tags ==== */

        case "HTML":
        case "HEAD":
        case "BODY":
        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":
            // Nothing to do
            break;

            /* ==== MRRT specific structural tags ==== */

        case "TITLE":
        case "EMBED":
            // Nothing to do
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
            // Nothing to do
            break;

        case "HEADER":  // SECTION header
            // Finish previous line and append blank line
            text += "\n\n";
            break;

        case "SELECT":  // A form to collect user input
            // Nothing to do
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // Text node decides whether the text must be appended (depending on 'selected' property)
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            switch (elm.type) {
                case 'text':
                case 'textarea':
                case 'number':
                case 'date':
                case 'time':
                    if (labelText != null) {
                        text += labelText + ": ";
                    }
                    text += elm.value + " ";
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        if (labelText != null) {
                            // Remove optional ending white spaces
                            text += labelText + ": ";
                        }
                        text += elm.value + " ";
                    }
                    break;

                default:
                    text += "\n" + "[Error: Attribute not supported in INPUT: " + elm.type + "]" + "\n";
            }
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Handling of ':' is done in text node processing
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "BR":	// Line break
            text += "\n";
            break;

        case "P":	// Paragraph
            text += "\n\n";
            break;

        case "A":	// Hyperlink
            text += "[" + elm.href + "] ";
            break;

        case "IMG":	// Image
            text += "[" + elm.src + ", " + elm.alt + "] ";
            break;

        case "OL":	// Ordered list
        case "UL":	// Unordered list
            text += "\n\n";
            break;

        case "LI":	// List item
            text += "\n";
            break;

        case "Q":	// Short quotation
            text += '" ';
            break;

        case "TABLE":	// Defines a table
            text += "\n\n";
            break;

        case "TR":	// Table row
            text += "\n";
            break;

        case "TD":	// Table cell
        case "TH":	// Header cell in a table
            // Nothing to do
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            // Nothing to do
            break;

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            if (labelText != null) {
                text += labelText + ": ";
            }
            text += elm.value;
            // Finish the line
            text += "\n";
            break;

        case "TBODY":
            // Nothing to do
            break;

        default:
            text += "\n" + "[Error: HTML element not allowed (postprocess): " + elm.nodeName + "]" + "\n";
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
    var parentElm = textNode.parentElement;
    if (parentElm == null) {
        text += "\n" + "[Error: Text node has no parent element: " + nodeText + "]" + "\n";
    }

    switch (parentElm.nodeName) {
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Labels should with ':'
            if (nodeText.indexOf(':', nodeText.length - 1) == -1) {
                nodeText += ":";
            }
            // Postfix with space.
            text += nodeText + " ";
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // 'selected' is a property
            if (parentElm.selected) {
                // Append text of selected options only. Postfix with space.
                text += nodeText + " ";
            }
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            switch (parentElm.type) {
                case 'checkbox':
                    break;
            }
            break;

        case "TD":	// Table cell
        case "TH":	// Header cell in a table
            // Postfix with tab.
            text += nodeText + "\t";
            break;

        default:
            // By default append text of selected options only. Postfix with space.
            text += nodeText + " ";
    }

    return text;
}

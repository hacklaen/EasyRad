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
    var elmVal;
    var elmText;
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
                    break;
                }

                // Should not be used: CSS hiding of elements
                if (childNode.style.display === 'none') {
                    break;
                }
                if (childNode.style.visibility === 'hidden') {
                    break;
                }

                switch (childNode.nodeName) {
                    case "SCRIPT":
                    case "STYLE":
                    case "LINK":
                        // Ignore SCRIPT, STYLE and LINK tags and theire children
                        break;

                    case "OPTION":  // 8.1.3.5.1 Selection Items
                        // Processed in getElmValue() for SELECT
                        break;

                    case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
                        // Processed for each element by getElmLabelText()
                        break;

                    case "TEXTAREA":
                        elmVal = getElmValue(childNode);
                        if (elmVal.length > 0) {
                            text += getElmPrefix(childNode);
                            text += getElmLabelText(childNode);
                            text += elmVal;
                            text += getElmPostfix(childNode);
                        }
                        // Ignore the child TEXT node: It is already value of the element
                        // Inside the element are no other elements allowed. Therefore no recursion neccessary
                        break;

                    default:
                        elmVal = getElmValue(childNode);
                        if (elmVal.length > 0) {
                            text += getElmPrefix(childNode);
                            text += getElmLabelText(childNode);
                            text += elmVal;
                            text += getElmPostfix(childNode);
                        }
                        text = walk(childNode, text);
                }
                break;

            case Node.TEXT_NODE:
                text = processTextNode(childNode, text);
                // Text nodes have no children. Therefore no recursion neccessary
                break;

            case Node.ATTRIBUTE_NODE:
                // Atribute nodes are processed in elements
                // Atribute nodes have no children. Therefore no recursion neccessary
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
 * Gets the value of the element as a String.
 * 
 * @param Element elm The element to analyse
 * @returns String The value of the element. An empty string is returned, if no value
 *                 is specified.
 */
function getElmValue(elm) {
    var parentElm;
    var elmValue;
    var childElms;

    // By default the value is empty
    elmValue = '';

    //console.log(elm.nodeName);
    //
    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

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
            // Nothing to do
            break;

            /* ==== MRRT specific structural tags ==== */

        case "TITLE":
        case "EMBED":
            // Nothing to do
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
        case "HEADER":  // SECTION header
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Nothing to do
            break;

        case "SELECT":  // A form to collect user input
            // Get all child elements (not nodes)
            childElms = elm.children;
            for (var i = 0; i < childElms.length; i++) {
                if (childElms[i].nodeName === "OPTION") {
                    if (childElms[i].hasAttribute("selected")) {
                        if (elmValue.length > 0) {
                            elmValue += OPTIONS_DELIMITER;
                        }
                        elmValue += childElms[i].getAttribute("value");
                    }
                }
            }
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // Options are evaluated by the "SELECT" element
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
            // Nothing to do
            break;

        case "A":	// Hyperlink
            elmValue = "[" + elm.href + "] ";
            break;

        case "IMG":	// Image
            elmValue = "[" + elm.src + ", " + elm.alt + "] ";
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

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            elmValue = elm.value;
            break;

        default:
            elmValue = "\n" + "[Error: HTML element not allowed (getElmValue): " + elm.nodeName + "]" + "\n";
    }

    return elmValue;
}


/**
 * Gets the text (node) of the element as a String.
 * 
 * @param Element elm The element to analyse
 * @returns String The text node of the element. An empty string is returned, if no text
 *                 is specified.
 */
function getElmText(elm) {
    var parentElm;
    var elmText;

    // By default the value is empty
    elmText = '';

    if (typeof elm === 'undefined') {
        return elmText;
    }

    //console.log(elm.nodeName);
    //
    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

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
        case "HEADER":  // SECTION header
        case "SELECT":  // A form to collect user input
        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            elmText = getElmTextNodes(elm);
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
        case "OPTION":  // 8.1.3.5.1 Selection Items
            // Text content is processed in getElementValue()
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "A":	// Hyperlink
        case "BR":	// Line break
        case "IMG":	// Image
        case "LI":	// List item
        case "OL":	// Ordered list
        case "P":	// Paragraph
        case "Q":	// Short quotation
        case "TABLE":	// Defines a table
        case "TR":	// Table row
        case "TD":	// Table cell
        case "TH":	// Header cell in a table
        case "UL":	// Unordered list
            elmText = getElmTextNodes(elm);
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            elmText = getElmTextNodes(elm);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Nothing to do
            break;

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            elmText = getElmTextNodes(elm);
            break;

        default:
            elmValue = "\n" + "[Error: Text node not allowed for element (getElmText): " + elm.nodeName + "]" + "\n";
    }

    if (elmText.replace(/\s/g, '').length == 0) {
        // Ignore text with white spaces only
        return '';
    } else {
        // Remove leading and trailing white spaces
        return elmText.trim();
    }
}


/**
 * NOTE: element.textContent returns the text of the element and all child elements.
 * 
 * @param {type} elm
 * @returns {undefined}
 */
function getElmTextNodes(elm) {
    var childNodes;
    var childNode;
    var text = '';

    childNodes = elm.childNodes;
    if (childNodes == null) {
        return text;
    }

    for (i = 0; i < childNodes.length; i++) {
        childNode = childNodes[i];
        if (childNode.nodeType === Node.TEXT_NODE) {
            if (text.length > 0) {
                text += ' ';
            }
            text += childNode.nodeValue;
        }
    }
    return text;
}


/**
 * 
 * @param {type} elm
 * @param {type} prefixText
 * @returns {unresolved}
 */
function getElmPrefix(elm) {
    var parentElm;

    // By default the prefix text is empty
    var prefixText = '';

    //console.log(elm.nodeName);
    //
    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

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
            prefixText += "\n\n";
            break;

        case "HEADER":  // SECTION header
        case "INPUT":   // Attribute type = prefixText, textarea, number, date, time, checkbox
        case "SELECT":  // A form to collect user input
        case "OPTION":  // 8.1.3.5.1 Selection Items
        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Nothing to do
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "LI":	// List item
            switch (parentElm.nodeName) {
                case "UL":
                    prefixText += "- ";
                    break;

                case "OL":
                    prefixText += "x. ";
                    break;

                default:
                    prefixText += "? ";
            }
            break;

        case "Q":	// Short quotation
            prefixText += '"';
            break;

        case "TABLE":	// Defines a table
            // Finish previous line and append a blank line
            prefixText += "\n\n";
            break;

        case "OL":	// Ordered list
        case "UL":	// Unordered list
            prefixText += "\n";
            break;

        case "A":	// Hyperlink
        case "BR":	// Line break
        case "IMG":	// Image
        case "P":	// Paragraph
        case "TD":	// Table cell
        case "TH":	// Header cell in a table
        case "TR":	// Table row
            // Nothing to do
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized prefixText, often in italics
        case "SPAN":	// Groups inline prefixText and other elements
        case "STRONG":	// Important prefixText, often bold
        case "SUB":	// Subscripted prefixText
        case "SUP":	// Superscripted prefixText
        case "U":	// Stylistically different prefixText, often underlined
            // Nothing to do
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Nothing to do
            break;

            /* ==== Elements not supported by MRRT ==== */

        case "TEXTAREA":
            // Finish previous line
            prefixText += "\n";
            break;

        default:
            prefixText += "\n" + "[Error: HTML element not allowed (preprocess): " + elm.nodeName + "]" + "\n";
    }

    return prefixText;
}


/**
 * Gets the text of the <label> associated to the element.
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
            labelText = parentElm.innerText.trim();
            break;

        default:
            // Find label            
            labelElms = $(document).find("label[for='" + elm.id + "']");
            if (labelElms.length > 0) {
                labelText = labelElms.text().trim();
            }
    }

//    // End the label with ':'
//    if (labelText.length > 0) {
//        if (labelText.slice(-1) !== ":") {
//            labelText = labelText + ":";
//        }
//    }

    return labelText;
}


/**
 * 
 * @param {type} elm
 * @returns {unresolved}
 */
function getElmPostfix(elm) {
    var parentElm;
    var labelText;

    // By default the postfix text is empty
    var posfixText = '';

    //console.log(elm.nodeName);
    //
    // Get the parent element
    // On some browsers, the parentElement property is only defined on nodes that are themselves an Element.
    // In particular, it is not defined on text nodes.
    // var parentElm = elm.parentElement;
    parentElm = elm.parentNode;

    // Get the optional label posfixText
    labelText = getElmLabelText(elm);

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
            posfixText += "\n\n";
            break;

        case "SELECT":  // A form to collect user input
            // Nothing to do
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // Text node decides whether the posfixText must be appended (depending on 'selected' property)
            break;

        case "INPUT":   // Attribute type = posfixText, textarea, number, date, time, checkbox
            switch (elm.type) {
                case 'posfixText':
                case 'number':
                case 'date':
                case 'time':
                    if (getElmValue(elm).length > 0) {
                        posfixText += " ";
                    }
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        posfixText += " ";
                    }
                    break;

                case 'textarea':
                    if (getElmValue(elm).length > 0) {
                        posfixText += labelText + " " + elm.value;
                        // Finish the line
                        posfixText += "\n";
                    }
                    break;

                default:
                    posfixText += "\n" + "[Error: Attribute not supported in INPUT: " + elm.type + "]" + "\n";
            }
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // Handling of ':' is done in posfixText node processing
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "BR":	// Line break
            posfixText += "\n";
            break;

        case "P":	// Paragraph
            posfixText += "\n\n";
            break;

        case "A":	// Hyperlink
            posfixText += " ";
            break;

        case "IMG":	// Image
            posfixText += " ";
            break;

        case "OL":	// Ordered list
        case "UL":	// Unordered list
            // Nothing to do
            break;

        case "LI":	// List item
            posfixText += "\n";
            break;

        case "Q":	// Short quotation
            posfixText += '" ';
            break;

        case "TABLE":	// Defines a table
            posfixText += "\n\n";
            break;

        case "TR":	// Table row
            posfixText += "\n";
            break;

        case "TD":	// Table cell
        case "TH":	// Header cell in a table
            posfixText += "\t";
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized posfixText, often in italics
        case "SPAN":	// Groups inline posfixText and other elements
        case "STRONG":	// Important posfixText, often bold
        case "SUB":	// Subscripted posfixText
        case "SUP":	// Superscripted posfixText
        case "U":	// Stylistically different posfixText, often underlined
            // Nothing to do
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Nothing to do
            break;

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            if (getElmValue(elm).length > 0) {
                // Finish the line
                posfixText += "\n";
            }
            break;

        default:
            posfixText += "\n" + "[Error: HTML element not allowed (postprocess): " + elm.nodeName + "]" + "\n";
    }

    return posfixText;
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
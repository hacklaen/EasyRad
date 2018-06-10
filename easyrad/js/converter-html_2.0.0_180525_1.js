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
 * @version 2.0.0
 * @author T. Hacklaender
 * @date 2018-05-25
 */


/**
 * Convert the content of the HTML root element to a new HTML DOM wiht form elements
 * replaced by span elements.
 * 
 * @param {Element} templateHtmlElm The root element of the included template.
 * @returns {Element} the template in the converted format as HTML.
 */
function convertToHtml(templateHtmlElm) {

    // Clone the element, but not the children
    var destRootElm = templateHtmlElm.cloneNode(false);

    // Process the HTML DOM
    walkHtml(templateHtmlElm, destRootElm);

    // Return the HTML text of the destination root element
    return destRootElm.innerHTML;
}

/**
 * 
 * @param {type} elmToProcess
 * @param {type} elmToAppendTo
 */
function walkHtml(elmToProcess, elmToAppendTo) {
    var i;
    var childNodes;
    var nodeToProcess;
    var nodeToProcessWoChildren;

    childNodes = elmToProcess.childNodes;

    // No more children to process -> terminate
    if (childNodes == null) {
        return;
    }

    for (i = 0; i < childNodes.length; i++) {
        nodeToProcess = childNodes[i];
        // Clone the child, but not the grandchildren
        nodeToProcessWoChildren = nodeToProcess.cloneNode(false);

//        console.log(nodeToProcess.nodeType);
//        console.log(nodeToProcess.nodeName);
//        console.log(nodeToProcess.nodeValue);
//        console.log("\n");

        switch (nodeToProcess.nodeType) {
            case Node.ELEMENT_NODE:
                processElementNodeHtml(nodeToProcess, elmToAppendTo);
                break;

            case Node.TEXT_NODE:
                // Copy the node into the destination DOM
                elmToAppendTo.appendChild(nodeToProcessWoChildren);
                // TEXT nodes have no children
                break;

            case Node.ATTRIBUTE_NODE:
                // Attributes are processed in element
                // Ignore it here
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
                // Copy the node into the destination DOM
                elmToAppendTo.appendChild(nodeToProcessWoChildren);
                walkHtml(nodeToProcess, elmToAppendTo)
                break;

            default:
                console.err('Error: Unknown node type = ' + nodeToProcess.nodeType);
                // Ignore the unknown node and its children
        }
    }
    return;
}


/**
 * Processes an ELEMENT node during HTML-work through DOM.
 * 
 * @param {Element} elm an element node
 * @param {Element} elmToAppendTo the node in the destination DOM to append to
 */
function processElementNodeHtml(elm, elmToAppendTo) {
    // Clone the element, but not the children
    var elmToProcessWoChildren = elm.cloneNode(false);
    // By default use the old element as the new element to append to 
    var newElmToAppendTo = elmToAppendTo;

    // Do not process 'hidden' elements and their chidren
    if (elm.hasAttribute("hidden")) {
        return newElmToAppendTo;
    }

    // Should not be used - use 'hidden' attribute instead: Do not process 'disabled' elements and their chidren
    if (elm.hasAttribute("disabled")) {
        return newElmToAppendTo;
    }

    // CSS hiding of elements should not be used: Do not process elements and their chidren
    if (elm.style.display === 'none') {
        return newElmToAppendTo;
    }
    if (elm.style.visibility === 'hidden') {
        return newElmToAppendTo;
    }
    // From the loaded HTML document the <html>, <head> and <body> elements 
    // were automatically removed.
    // The child elements of <head> and <body> are inserted in the sequence 
    // of appearing in the origibnal file

    switch (elm.nodeName) {

            /* ==== Elements which are defined in MRRT, but are not embedded
             *      into index.html when loading the template.               ==== */

        case "HTML":
        case "HEAD":
        case "TITLE":
        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":        // To reference stylesheets: rel="stylesheet" type="text/css" href="..."
        case "BODY":
        case "EMBED":       // 8.1.4 Incorporating Templates into Other Templates
            break;

        /* ==== Elements to ignore ==== */

        case "MARK":	// Used bei DRG to identify elements which are visible during filling out the template, but are not content of the report
            // Ignore elements and their children
            break;

            /* ==== General HTML structural tags ==== */

        case "SECTION":     // 8.1 Report Template Structure
        case "HEADER":      // SECTION header
        case "P":           // Paragraph
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);
            newElmToAppendTo = elmToProcessWoChildren;
            walkHtml(elm, newElmToAppendTo);
            break;

            /* ==== 8.1.3 Report Template Fields ==== */

        case "TEXTAREA":
            newElmToAppendTo = appendFormElement(elm, elmToAppendTo)
            walkHtml(elm, newElmToAppendTo);
            break;

        case "SELECT":  // A form to collect user input
            newElmToAppendTo = appendFormElement(elm, elmToAppendTo)
            walkHtml(elm, newElmToAppendTo);
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONs are evaluated by the "SELECT" element
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // LABELs are evaluated by processing the referenced form element
            break;

        case "INPUT":   // Attribute type = text, number, single, multiple, date, time, checkbox (, textarea for backward compatibility)
            newElmToAppendTo = appendFormElement(elm, elmToAppendTo)
            walkHtml(elm, newElmToAppendTo);
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "A":	// Hyperlink
        case "BR":	// Line break
        case "DIV":	// Container that can be used to group elements
        case "EM":	// Emphasized text, often in italics
        case "IMG":	// Image
        case "LI":	// List item
        case "OL":	// Ordered list
        case "P":	// Paragraph
        case "Q":	// Short quotation
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "TABLE":	// Defines a table
        case "TD":	// Table cell
        case "TH":	// Header cell in a table
        case "TR":	// Table row
        case "U":	// Stylistically different text, often underlined
        case "UL":	// Unordered list
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);
            newElmToAppendTo = elmToProcessWoChildren;
            walkHtml(elm, newElmToAppendTo);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);
            newElmToAppendTo = elmToProcessWoChildren;
            walkHtml(elm, newElmToAppendTo);
            break;

            /* ==== Elements not supported by MRRT ==== */

        default:
            // Ignore element
            console.err('ERROR: Element not specified in MRRT -> ignored: ' + elm.nodeName);
    }
}


/**
 * Append the label and value of a form element as text nodes.
 * 
 * @param {Element} elm an element node
 * @param {Element} elmToAppendTo the node in the destination DOM to append to
 * @returns {string} The optional modified report text.
 */
function appendFormElement(elm, elmToAppendTo) {
    var elmSpan;
    var labelSpan;

    var newElmToAppendTo = elmToAppendTo;

    // Get the form element as a span element
    elmSpan = getFormElmAsSpan(elm);
    if (elmSpan === null) {
        return newElmToAppendTo;
    }

    // Get the optional label as a span element
    labelSpan = getFormElmLabelAsSpan(elm);

    if (labelSpan === null) {
        elmToAppendTo.appendChild(elmSpan);
    } else {
        if (isElmLabelPostfix(elm)) {
            elmToAppendTo.appendChild(elmSpan);
            elmToAppendTo.appendChild(labelSpan);
        } else {
            elmToAppendTo.appendChild(labelSpan);
            elmToAppendTo.appendChild(elmSpan);
        }
    }

    return newElmToAppendTo;
}


/**
 * Gets 
 * 
 * NOTE: To allow processing of templates which are not strict conform to MRRT,
 * inline labels are processed here also.
 * For the strict rule see MRRT: 8.1.3.2 Linkage Between Template Text and Template Fields
 * 
 * @param Element elm The element to which the label should be searched
 * @returns Element The text of the label. An empty string is returned, if no label
 *                 is specified.
 */
function getFormElmAsSpan(elm) {
    var spanElm;
    var textNode;
    var text;
    var childElms;

    if (typeof elm === 'undefined') {
        return null;
    }

    // By default no text
    text = '';

    switch (elm.nodeName) {

        case "TEXTAREA":
            text = elm.value;
            break;

        case "SELECT":  // A form to collect user input
            //  The value of the SELECT element is the text of the selected option(s)
            // Get all child elements (not nodes)
            childElms = elm.childNodes;
            for (var i = 0; i < childElms.length; i++) {
                if (childElms[i].nodeName === "OPTION") {
                    if (childElms[i].selected) {
                        if (text.length > 0) {
                            text += OPTIONS_DELIMITER;
                        }
                        // MRRT specifies in 8.1.3.5.1 Selection Items, that the value of an OPTION is its value attribute, not the displayed text
                        // Text and content of value attribute must be the same according to MRRT!
                        if (USE_OPTION_TEXT) {
                            // Returns all text nodes of the OPTION element and its children
                            text += childElms[i].textContent;
                        } else {
                            text += childElms[i].getAttribute("value");
                        }
                    }
                }
            }
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            switch (elm.type) {
                case 'text':
                case 'number':
                case 'date':
                case 'time':
                case 'textarea':   // For compatibility with older versions of MRTT
                    text = elm.value;
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        text = elm.value;
                    }
                    break;

                default:
                // Nothing to do: Warning ist given in processElementNode
            }
            break;

        default:
            console.err('ERROR getFormElmValue: Form element is not specified in MRRT: ' + elm.nodeName);
    }

    if ((text === null) || (text.length === 0)) {
        return null;
    }

    spanElm = elm.ownerDocument.createElement('span');
    // Set the attributes of span element accoring to the label element
    for (var i = 0; i < elm.attributes.length; i++) {
        var attrib = elm.attributes[i];
        spanElm.setAttribute(attrib.name, attrib.value);
    }
    // Preserve original element type
    spanElm.setAttribute("data-org-elm-type", elm.nodeName);

    textNode = document.createTextNode(HTML_FORM_PRAEFIX + text + HTML_FORM_POSTFIX);
    spanElm.appendChild(textNode);

    return spanElm;
}

/**
 * Gets the <label> associated with an element as a span element with text.
 * 
 * NOTE: To allow processing of templates which are not strict conform to MRRT,
 * inline labels are processed here also.
 * For the strict rule see MRRT: 8.1.3.2 Linkage Between Template Text and Template Fields
 * 
 * @param Element elm The element to which the label should be searched
 * @returns String The text of the label. An empty string is returned, if no label
 *                 is specified.
 */
function getFormElmLabelAsSpan(elm) {
    var labelText;
    var jqLabelElms;
    var labelElm;
    var spanElm;
    var textNode;

    if (typeof elm === 'undefined') {
        return null;
    }

    // Find label as JQuery elements         
    jqLabelElms = $(document).find("label[for='" + elm.id + "']");

    // No label found
    if (jqLabelElms.length === 0) {
        return null;
    }

    labelText = jqLabelElms.text().trim();
    // No text in label
    if (labelText.length === 0) {
        return null;
    }

    // Get the native DOM element from the JQuery element:
    // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/ 
    labelElm = jqLabelElms[0];

    // End the label with suffix
    if ((labelText.length > 0) && (!labelText.endsWith(LABEL_SUFFIX))) {
        labelText = labelText + LABEL_SUFFIX;
    }

    spanElm = elm.ownerDocument.createElement('span');
    // Set the attributes of span element accoring to the label element
    for (var i = 0; i < labelElm.attributes.length; i++) {
        var attrib = labelElm.attributes[i];
        spanElm.setAttribute(attrib.name, attrib.value);
    }
    // Preserve original element type
    spanElm.setAttribute("data-org-elm-type", labelElm.nodeName);

    textNode = document.createTextNode(HTML_FORM_PRAEFIX + labelText + HTML_FORM_POSTFIX);
    spanElm.appendChild(textNode);

    return spanElm;
}


/**
 * Retrns true, if the <label> and the associated element are siblings
 * and the label is defined after the definition of the element. 
 * 
 * @param Element elm the element to search the abel for
 * @returns boolean true, if the <label> and the associated element are siblings
 *                  and the label is defined after the definition of the element.
 */
function isElmLabelPostfix(elm) {
    var siblingElm;
    var id;

    if (typeof elm === 'undefined') {
        return false;
    }

    id = elm.getAttribute("id");
    // No ID attribute specified. So no label can referenced.
    if ((id === null) || (id.length === 0)) {
        return false;
    }

    siblingElm = elm;
    while (true) {
        siblingElm = siblingElm.nextElementSibling;
        if (siblingElm === null) {
            return false;
        }
        if (siblingElm.nodeName === "LABEL") {
            if (siblingElm.getAttribute("for") === id) {
                return true;
            }
        }
    }
}

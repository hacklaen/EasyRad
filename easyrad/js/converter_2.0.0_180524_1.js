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
 * @date 2018-05-18
 */


/**
 * Convert the content of the HTML root element to a new HTML DOM wiht form elements
 * replaced by span elements.
 * 
 * @param {JQuery} jqElm The root element of the JQuery HTML DOM.
 * @returns the formatted text.
 */
function convertToHtml(jqElm) {
    //console.log("convertToHtml: " + jqElm.prop('nodeName'));

    // Get the native DOM element from the JQuery element:
    // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/ 
    var node = jqElm[0];

    // Clone the element, but not the children
    var destRootElm = node.cloneNode(false);

    // Process the HTML DOM
    walkHtml(node, destRootElm);

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

    switch (elm.nodeName) {

        /* ==== Elements to ignore ==== */

        case "MARK":	// Used bei DRG to identify elements which are visible during filling out the template, but are not content of the report
        case "EMBED":	// 8.1.4 Incorporating Templates into Other Templates
            // Ignore elements and their children
            break;

            /* ==== General HTML structural tags ==== */

        case "HTML":

        case "HEAD":
        case "TITLE":
        case "META":
        case "SCRIPT":
        case "STYLE":
        case "LINK":        // To reference stylesheets: rel="stylesheet" type="text/css" href="..."

        case "BODY":
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
    var textNode;
    var textValue;
    var labelSpan;

    var newElmToAppendTo = elmToAppendTo;

    // Get the optional label as a span element
    labelSpan = getElmLabelAsSpan(elm);

    textValue = getFormElmValue(elm);
    textNode = elmToAppendTo.ownerDocument.createTextNode(textValue);

    if (labelSpan == null) {
        elmToAppendTo.appendChild(textNode);
    } else {
        if (isElmLabelPostfix(elm)) {
            elmToAppendTo.appendChild(textNode);
            elmToAppendTo.appendChild(labelSpan);
        } else {
            elmToAppendTo.appendChild(labelSpan);
            elmToAppendTo.appendChild(textNode);
        }
    }

    return newElmToAppendTo;
}


/**
 * Gets the value of a form element as a String.
 * 
 * @param Element elm The element to analyse
 * @returns String The value of the element. An empty string is returned, if no value
 *                 is specified.
 */
function getFormElmValue(elm) {
    var elmValue;
    var childElms;

    // By default the value is empty
    elmValue = '';

    switch (elm.nodeName) {

        case "TEXTAREA":
            elmValue = elm.value;
            break;

        case "SELECT":  // A form to collect user input
            //  The value of the SELECT element is the text of the selected option(s)
            // Get all child elements (not nodes)
            childElms = elm.childNodes;
            for (var i = 0; i < childElms.length; i++) {
                if (childElms[i].nodeName === "OPTION") {
                    if (childElms[i].selected) {
                        if (elmValue.length > 0) {
                            elmValue += OPTIONS_DELIMITER;
                        }
                        // MRRT specifies in 8.1.3.5.1 Selection Items, that the value of an OPTION is its value attribute, not the displayed text
                        // Text and content of value attribute must be the same according to MRRT!
                        if (USE_OPTION_TEXT) {
                            // Returns all text nodes of the OPTION element and its children
                            elmValue += childElms[i].textContent;
                        } else {
                            elmValue += childElms[i].getAttribute("value");
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
                    elmValue = elm.value;
                    break;

                case 'checkbox':
                    if (elm.checked) {
                        elmValue = elm.value;
                    }
                    break;

                default:
                // Nothing to do: Warning ist given in processElementNode
            }
            break;

        default:
            console.err('ERROR getFormElmValue: Element is not a MRRT specified form element: ' + elm.nodeName);
    }

    return elmValue;
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
function getFormElmAsSpan(elm, text) {
    var spanElm;
    var textNode;

    if (typeof elm === 'undefined') {
        return null;
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
    // preserve original element type
    spanElm.setAttribute("original-element-type", elm.nodeName);

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
function getElmLabelAsSpan(elm) {
    var labelText;
    var labelElms;
    var spanElm;
    var textNode;

    if (typeof elm === 'undefined') {
        return null;
    }

    // Find label            
    labelElms = $(document).find("label[for='" + elm.id + "']");
    // No label found
    if (labelElms.length === 0) {
        return null;
    }

    labelText = labelElms.text().trim();
    // No text in label
    if (labelText.length === 0) {
        return null;
    }

    // End the label with suffix
    if ((labelText.length > 0) && (!labelText.endsWith(LABEL_SUFFIX))) {
        labelText = labelText + LABEL_SUFFIX;
    }

    spanElm = elm.ownerDocument.createElement('span');
    // Set the attributes of span element accoring to the label element
    for (var i = 0; i < elm.attributes.length; i++) {
        var attrib = elm.attributes[i];
        spanElm.setAttribute(attrib.name, attrib.value);
    }
    // preserve original element type
    spanElm.setAttribute("original-element-type", elm.nodeName);

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

/**
 * Convert the content of the HTML root element to formatted TEXT.
 * 
 * @param {type} htmlElm The root element of the JQuery HTML DOM.
 * @returns the formatted text.
 */
function convertToText(htmlElm) {
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

/*
 * jQuery function that convert HTML to plain text
 */
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
    return walkText(domElement, "");
}

/**
 * 
 * @param {type} node
 * @param {type} text
 * @returns {String}
 */
function walkText(node, text) {
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
                text = sendMessage('[Error: Unknown node type = ' + childNode.nodeType + ']', text);
                text = walkText(childNode, text);
        }
    }
    return text;
}


/**
 * Processes an ELEMENT node during work throu DOM.
 * 
 * @param {Element} elm
 * @param {string} text The report text.
 * @returns {string} The optional modified report text.
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
    if (parentElm == null) {
        return text;
    }

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
            text = walkText(elm, text);
            break;

            /* ==== 8.1.3. Report template fields ==== */

        case "SECTION": // 8.1 Report Template Structure
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walkText(elm, text);
            break;

        case "HEADER":  // SECTION header
            text = walkText(elm, text);
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
            text = walkText(elm, text);
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONS are evaluated in getElmValue() for SELECT element
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            text = walkText(elm, text);
            break;

        case "INPUT":   // Attribute type = text, textarea, number, date, time, checkbox
            text = walkText(elm, text);
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
                    text = sendMessage('[Warning: Value of type attribute not supported for INPUT: ' + elm.type + ']', text);
            }
            break;

            /* ==== 8.1.5 Permitted HTML5 Formatting Tags ==== */

        case "A":	// Hyperlink
            text += "[" + elm.href + "] ";
            text = walkText(elm, text);
            text += " ";
            break;

        case "BR":	// Line break
            text = walkText(elm, text);
            text += "\n";
            break;

        case "IMG":	// Image
            text += "[" + elm.src + ", " + elm.alt + "] ";
            text = walkText(elm, text);
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
            text = walkText(elm, text);
            text += "\n";
            break;

        case "OL":	// Ordered list
        case "UL":	// Unordered list
            text += "\n";
            text = walkText(elm, text);
            break;

        case "DIV":	// NOT SPECIFIED IN MRRT. SHOULD BE REMOVED. Document division
        case "P":	// Paragraph
            text = walkText(elm, text);
            text += "\n\n";
            break;

        case "Q":	// Short quotation
            text += '"';
            text = walkText(elm, text);
            text += '" ';
            break;

        case "TABLE":	// Defines a table
            // Finish previous line and append a blank line
            text += "\n\n";
            text = walkText(elm, text);
            text += "\n\n";
            break;

        case "TD":	// Table cell
        case "TH":	// Header cell in a table
            text = walkText(elm, text);
            text += "\t";
            break;

        case "TR":	// Table row
            text = walkText(elm, text);
            text += "\n";
            break;

            /* ==== General HTML formatting tags ==== */

        case "EM":	// Emphasized text, often in italics
        case "SPAN":	// Groups inline text and other elements
        case "STRONG":	// Important text, often bold
        case "SUB":	// Subscripted text
        case "SUP":	// Superscripted text
        case "U":	// Stylistically different text, often underlined
            text = walkText(elm, text);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            text = walkText(elm, text);
            break;

            /* ==== Elements not supported by MRRT but replaced for editing  ==== */
            /* ==== Therefore NO warning or error message has to be generated ==== */

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

            /* ==== Elements not supported by MRRT ==== */

        default:
            text = sendMessage('[Element ignored by MRRT: ' + elm.nodeName + ']', text);
    }

    return text;
}


/**
 * Processes a TEXT node during work throu DOM.
 * 
 * @param {Node} textNode
 * @param {string} text The report text.
 * @returns {string} The optional modified report text.
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
        text = sendMessage('[Error: Text node has no parent element: ' + nodeText + ']', text);
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
            childElms = elm.childNodes;
            for (var i = 0; i < childElms.length; i++) {
                if (childElms[i].nodeName === "OPTION") {
                    if (childElms[i].selected) {
                        if (elmValue.length > 0) {
                            elmValue += OPTIONS_DELIMITER;
                        }
                        // MRRT specifies in 8.1.3.5.1 Selection Items, that the value of an OPTION is its value attribute, not the displayed text
                        // Text and content of value attribute must be the same according to MRRT!
                        if (USE_OPTION_TEXT) {
                            // Returns all text nodes of the OPTION element and its children
                            elmValue += childElms[i].textContent;
                        } else {
                            elmValue += childElms[i].getAttribute("value");
                        }
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
                // Nothing to do: Warning ist given in processElementNode
            }
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

            /* ==== Elements not supported by MRRT but found in DRG templates ==== */

        case "TEXTAREA":
            elmValue = elm.value;
            break;

        default:
        // Nothing to do: Warning ist given in processElementNode
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
    if (parentElm == null) {
        return labelText;
    }
    switch (parentElm.nodeName) {

        case "LABEL":
            // Inline labels are not specified in MRRT: 8.1.3.2 Linkage Between Template Text and Template Fields
            console.warn("[WARNING: Inline labels are not supported by MRRT]", labelText);
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
    if ((labelText.length > 0) && (!labelText.endsWith(LABEL_SUFFIX))) {
        labelText = labelText + LABEL_SUFFIX;
    }

    return labelText;
}
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
 * This file contains the HTML converter for the templates.
 *  
 * @version 2.0.0
 * @author T. Hacklaender
 * @date 2018-05-25
 */


/**
 * Converts a completed template to HTML code without form-elements. The form-elements
 * are replaced with span-Elements, which enclose the value of the form element
 * after processing by the user.
 * 
 * @param {Element} templateHtmlElm the root element of the completed template.
 * @returns {Element} the converted HTML code.
 */
function convertToHtml(templateHtmlElm) {

    // Clone the element, but not the children
    var destRootElm = templateHtmlElm.cloneNode(false);

    // Process the HTML DOM
    walkHtml(templateHtmlElm, destRootElm);

    // Return the converted template as HTML element
    return destRootElm;
}

/**
 * Recursively walks through the HTML DOM of the completed template.
 * 
 * @param {Node} nodeToProcess the next node to process.
 * @param {Node} nodeToAppendTo the node to append processed code to.
 */
function walkHtml(nodeToProcess, nodeToAppendTo) {
    var i;
    var childNodes;
    var childNodeToProcess;
    var childNodeToProcessWoChildren;

    childNodes = nodeToProcess.childNodes;

    // No more children to process -> terminate
    if (childNodes === null) {
        return;
    }

    for (i = 0; i < childNodes.length; i++) {
        childNodeToProcess = childNodes[i];
        // Clone the child, but not the grandchildren
        childNodeToProcessWoChildren = childNodeToProcess.cloneNode(false);

//        console.log(childNodeToProcess.nodeType);
//        console.log(childNodeToProcess.nodeName);
//        console.log(childNodeToProcess.nodeValue);
//        console.log("\n");

        switch (childNodeToProcess.nodeType) {
            case Node.ELEMENT_NODE:
                processElementNodeHtml(childNodeToProcess, nodeToAppendTo);
                break;

            case Node.TEXT_NODE:
                // Copy the node into the destination DOM
                nodeToAppendTo.appendChild(childNodeToProcessWoChildren);
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
                nodeToAppendTo.appendChild(childNodeToProcessWoChildren);
                walkHtml(childNodeToProcess, nodeToAppendTo);
                break;

            default:
                console.error('Error: Unknown node type = ' + childNodeToProcess.nodeType);
                // Ignore the unknown node and its children
        }
    }
    return;
}


/**
 * Processes an element node during HTML-work through DOM.
 * 
 * @param {Element} elmToProcess the next element to process.
 * @param {Element} elmToAppendTo the element to append processed code to.
 */
function processElementNodeHtml(elmToProcess, elmToAppendTo) {
    var elmTextContent;

    // Clone the element, but not the children
    var elmToProcessWoChildren = elmToProcess.cloneNode(false);

    // Do not process 'hidden' elements and their chidren
    if (elmToProcess.hasAttribute("hidden")) {
        return;
    }

    // Should not be used - use 'hidden' attribute instead: Do not process 'disabled' elements and their chidren
    if (elmToProcess.hasAttribute("disabled")) {
        return;
    }

    // CSS hiding of elements should not be used: Do not process elements and their chidren
    if (elmToProcess.style.display === 'none') {
        return;
    }
    if (elmToProcess.style.visibility === 'hidden') {
        return;
    }

    // From the loaded HTML document the <html>, <head> and <body> elements 
    // were automatically removed.
    // The child elements of <head> and <body> are inserted in the sequence 
    // of appearing in the origibnal file
    switch (elmToProcess.nodeName) {

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
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);  // Append SECTION element
            walkHtml(elmToProcess, elmToProcessWoChildren);     // Process children of SECTION element
            if (IGNORE_EMPTY_SECTION_ELEMENTS) {
                removeEmptySectionElement(elmToProcessWoChildren);
            }
            break;

        case "HEADER":      // SECTION header
        case "P":           // Paragraph
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);
            walkHtml(elmToProcess, elmToProcessWoChildren);
            break;

            /* ==== 8.1.3 Report Template Fields ==== */

        case "TEXTAREA":
            appendFormElement(elmToProcess, elmToAppendTo);
            // The value of children of a textarea element is set as the default
            // text content. Because the content of the completed form is accessed
            // by the elements value, all children could be ignored.
            break;

        case "SELECT":  // A form to collect user input
            appendFormElement(elmToProcess, elmToAppendTo);
            walkHtml(elmToProcess, elmToAppendTo);
            break;

        case "OPTION":  // 8.1.3.5.1 Selection Items
            // OPTIONs are evaluated by the "SELECT" element
            break;

        case "LABEL":   // 8.1.3.2 Linkage Between Template Text and Template Fields
            // LABELs are evaluated by processing the referenced form element
            break;

        case "INPUT":   // Attribute type = text, number, single, multiple, date, time, checkbox (, textarea for backward compatibility)
            appendFormElement(elmToProcess, elmToAppendTo);
            walkHtml(elmToProcess, elmToAppendTo);
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
            walkHtml(elmToProcess, elmToProcessWoChildren);
            break;

            /* ==== Elements optional generated by browser ==== */

        case "TBODY":
            // Copy the element to the destination DOM
            elmToAppendTo.appendChild(elmToProcessWoChildren);
            walkHtml(elmToProcess, elmToProcessWoChildren);
            break;

            /* ==== Elements not supported by MRRT ==== */

        default:
            // Ignore element
            console.error('ERROR: Element not specified in MRRT -> ignored: ' + elmToProcess.nodeName);
    }
}


/**
 * Converts a form element to a span-element and appends that as a child to a given 
 * element. If the form element is referenced by a label-element, the value label 
 * of the label is appended as a span as well.
 * The attributes of the form element and the label are preserved in the span-elements.
 * For reference purposes an attribute with name="data-org-elm-type" and a value
 * corresponding to the form's tag type is added.
 * 
 * @param {Element} elm the element to append
 * @param {Element} elmToAppendTo the element to append to
 */
function appendFormElement(elm, elmToAppendTo) {
    var elmSpan;
    var labelSpan;

    // Get the form element as a span element
    elmSpan = getFormElmAsSpan(elm);
    if (elmSpan === null) {
        if (IGNORE_LABELS_OF_EMPTY_ELEMENTS) {
            return;
        }
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
}


/**
 * Converts a form element to a span-element.
 * The attributes of the form element is preserved in the span-element.
 * For reference purposes an attribute with name="data-org-elm-type" and a value
 * corresponding to the form's tag type is added.
 * 
 * @param {Element} elm the element to convert.
 * @returns {Element} the span-element. Returns null if the completed form element
 *                    does not contain any text.
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
                        text += childElms[i].getAttribute("value");
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
            console.error('ERROR getFormElmValue: Form element is not specified in MRRT: ' + elm.nodeName);
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
 * Gets an optional label-element referencing a given form element and returns 
 * its the value as a span-element.
 * The attributes of the label is preserved in the span-elements.
 * For reference purposes an attribute with name="data-org-elm-type" and a
 * value="LABEL" is added.
 * 
 * @param {Element} elm the element to which the label should be searched.
 * @returns {String} the value of the label as a span-element. null is returned
 *                   if no label is specified.
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

/**
 * Removes empty SECTION elements. A SECTION element is empty, if its children
 * (except the HEADER elment) do not contain any text.
 * 
 * @param {Element} sectionElm the element to remove.
 */
function removeEmptySectionElement(sectionElm) {
    var parentElm = sectionElm.parentElement;
    var textContent = "";
    var childNodes;
    var childNodeToProcess;
    var i;

    // Process all child nodes
    childNodes = sectionElm.childNodes;
    for (i = 0; i < childNodes.length; i++) {
        childNodeToProcess = childNodes[i];
        // Process elements only
        if (childNodeToProcess.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }
        // Ignore HEADER elements
        if (childNodeToProcess.nodeName === "HEADER") {
            continue;
        }
        // Append text of non-HEADER elements
        textContent += childNodeToProcess.innerText.trim();
    }

    // Remove the section element if no text was found in children 
    if (textContent.length === 0) {
        parentElm.removeChild(sectionElm);
    }
}
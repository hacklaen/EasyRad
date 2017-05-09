/* 
 * Definitions of project globals and tool functions.
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
 * @version 0.1 alpha
 * @author T. Hacklaender
 * @date 2017-05-08
 */


/* Dublin Core Metadata defined in MRRT table 8.1.1-1: Dublin Core Metadata Elements for Report Templates.
 * MRRT specifies the metadata in the format 'dcterms:title' wheras RSNA templates and the IHE sample file
 * use the notation 'dcterms.title' */
var dcTerms = [
    'dcterms.title',
    'dcterms.identifier',
    'dcterms.type',
    'dcterms.publisher',
    'dcterms.rights',
    'dcterms.license',
    'dcterms.date',
    'dcterms.creator',
    'dcterms.contributor',
    'dcterms.relation',
    'dcterms.language',
];


/* Template attributes defined in MRRT table 8.1.1-2: Other Metadata Elements for Report Templates */
var templateAttributes = [
    'top-level-flag',
    'status',
    'user-list',
    'provider-group-list',
];


/**
 * Gets the <script> element containing XML content.
 * MRRT allows only one <script> element of this type in a template file.
 * 
 * @param Document doc The HTML template document to analyse
 * @returns The <script> element containing XML content, null if not found.
 */
function getXmlScriptElm(doc) {
    var scriptElms;

    // Get template attributes
    scriptElms = doc.getElementsByTagName('script');
    for (var i = 0; i < scriptElms.length; i++) {
        if (scriptElms[i].getAttribute('type') === 'text/xml') {
            return scriptElms[i];
        }
    }

    // Not found
    return null;
}

/**
 * Converts <script> element containing XML content into a XML document.
 * The root element of the XML document is set to <root>.
 * 
 * @param Element xmlScriptElm The <script> element containg the XML text.
 * @returns Document The template attributes as XML document
 */
function xmlScriptToXmlDoc(xmlScriptElm) {
    var xml;
    var parser;
    var xmlDoc;
    // Convert the content of the <script> element into an XML document
    xml = xmlScriptElm.textContent;
    // Create a valid XML structure
    xml = '<?xml version="1.0" encoding="UTF-8"?> <root> ' + xml + ' </root>';
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml, "text/xml");

    return xmlDoc;
}


/**
 * Replaces a <input type="textarea"> element with a <textarea> element.
 * All attributes besides the 'type' attribute are copied to the new element.
 * 
 * @param {Element} elm the INPUT element to replace
 */
function replaceInputWithTextarea(elm) {
    var textareaElm;

    textareaElm = elm.ownerDocument.createElement('textarea');

    // Copy all attributes
    for (var i = 0; i < elm.attributes.length; i++) {
        var attr = elm.attributes.item(i);
        // Skip the type attribute
        if (attr.nodeName !== 'type') {
            textareaElm.setAttribute(attr.nodeName, attr.nodeValue);
        }
    }

    // Replace
    elm.parentNode.replaceChild(textareaElm, elm);
}


/**
 * Replaces a <textarea> element with a <input type="textarea"> element.
 * All attributes besides the 'type' attribute are copied to the new element.
 * 
 * @param {Element} elm the TEXTAREA element to replace
 */
function replaceTextareaWithInput(elm) {
    var inputElm;

    inputElm = elm.ownerDocument.createElement('input');
    inputElm.setAttribute('type', 'textarea');

    // Copy all attributes
    for (var i = 0; i < elm.attributes.length; i++) {
        var attr = elm.attributes.item(i);
        inputElm.setAttribute(attr.nodeName, attr.nodeValue);
    }

    // Replace
    elm.parentNode.replaceChild(inputElm, elm);
}


/**
 * Tests if a string ends with a suffix string
 * @param {String} suffix The suffix to test
 * @returns {Boolean} True, if the suffix matches the end of the string
 */
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


/**
 * Hack to save a text as a file in the local filesystem.
 * 
 * Link: https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
 * 
 * @param String textToSave The text to save.
 * @param String fileNameToSaveAs The name (not the path!) of the file to save.
 */
function saveTextAsFile(textToSave, fileNameToSaveAs) {
    var textToSaveAsBlob = new Blob([textToSave], {type: "text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

/**
 * Call back of function saveTextAsFile() called after saving the file.
 * @param {type} event
 */
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}


/**
 * Get the localized string corresponing to a given key.
 * The localization is given in the language, which is preselected in the used
 * browser.
 * 
 * @param key The key to search the localization for
 * @returns The localized string. If no translation is found for the requested
 *          language, English is used as a fallback. If no translation could be
 *          found, the key is returned as a last fallback.
 */
function i18n(key) {
    var t;
    var iso = navigator.language || navigator.userLanguage;

    // If no translations available return the given keying as fallback
    if (typeof translations === 'undefined') {
        return key;
    }
    // Will evaluate to true if value is not: null, undefined, NaN, empty keying (""), 0 or false
    // Return english translation as a fallback
    if (!iso) {
        iso = "en";
    }
    if (iso.length < 2) {
        iso = "en";
    }

    // Get the ISO 639-1 two-letter code
    iso = iso.substr(0, 2);

    // Get the translation
    t = translations[iso][key];

    if (t) {
        return t;
    } else {
        // If no translations available return the given keying as fallback
        return key;
    }
}

/**
 * Send a message (error or warning) to the user.
 * The destination is specified in the configuration parameter MESSAGE_DESTINATION:
 * 'CONSOLE': The message is displayed on the JavaScript console in the browser.
 * 'REPORT': The message is inserted in the report text.
 * 'NO', false, empty or not specified: The message is not displayed
 * 
 * @param {String} msg
 * @param {String} reportText If null the MESSAGE_DESTINATION option "REPORT"
 *                            has no effect and null is returned.
 * @returns {String} The optional modified reportText parameter.
 */
function sendMessage(msg, reportText) {

    if ((typeof MESSAGE_DESTINATION === "undefined") || (!MESSAGE_DESTINATION)) {
        return reportText;
    }

    switch (MESSAGE_DESTINATION) {
        case 'CONSOLE':
            console.log(msg + `\n`);
            break;

        case 'REPORT':
            if (typeof reportText === "string") {
                reportText += msg + ' ';
            }
            break;

        default:
        // Nothing to do
    }
    return reportText;
}
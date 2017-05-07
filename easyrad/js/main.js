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
 * @date 2017-05-05
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
 * Tests if a string ends with a suffix string
 * @param {String} suffix The suffix to test
 * @returns {Boolean} True, if the suffix matches the end of the string
 */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/* 
 * EasyRad Editor - Definition of empty templates
 *
 * This browser application allows to edit MRRT templates.
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
 * @date 2017-05-03
 */


/**
 * Sets a new template with no sections in the content.
 */
function newTemplate() {
    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');
//    addEmptyHead(doc);

    setTemplateDoc(doc);
}


/**
 * Creates a new template based on the structure defined in DICOM PS3.20
 * "Imaging Reports using HL7​ Clinical Document Architecture"
 */
function newDicom20() {
    var sectionElm;
    var headerElm;

    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');
//    addEmptyHead(doc);

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Clinical Information');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Clinical Information';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T01');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Imaging Procedure Description');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Imaging Procedure Description';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T02');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Comparison Study');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Comparison Study';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T03');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Findings');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Findings';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T04');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Impression');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Impression';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T05');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Addendum');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Addendum';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T06');

    setTemplateDoc(doc);
}

/**
 * Creates a new template based on the structure defined in DIN25300-1
 * "Prozesse in der Radiologie — Teil 1: Befundung eines bildgebenden oder bildgestützten Verfahrens"
 */
function newDin25300() {
    var sectionElm;
    var headerElm;

    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');
//    addEmptyHead(doc);

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Klinische Angaben');
    sectionElm.setAttribute('data-section-required', 'true');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Klinische Angaben';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T01');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Medizinische Fragestellung');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Medizinische Fragestellung';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T02');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Befundungs Fragestellung');
    sectionElm.setAttribute('data-section-required', 'true');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Befundungs Fragestellung';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T03');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Beschreibung');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Beschreibung';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T04');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Beurteilung');
    sectionElm.setAttribute('data-section-required', 'true');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Beurteilung';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T05');

    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('class', 'level1');
    sectionElm.setAttribute('data-section-name', 'Empfehlung');
    sectionElm.setAttribute('data-section-required', 'false');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = 'Empfehlung';
    sectionElm.appendChild(headerElm);
    appendTextareaChild(sectionElm, '', 'T06');

    setTemplateDoc(doc);
}

/**
 * Adds template attributes to the document.
 * See: 8.1.1 Template Attributes in MRRT documentation.
 * 
 * @param doc The documnet to add to.
 */
function addEmptyHead(doc) {
    var metaElm;
    var scriptElm;
    var template_attributes_Elm;
    var top_level_flag_Elm;

    metaElm = doc.createElement('META');
    metaElm.setAttribute('charset', 'UTF-8');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.title');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.identifier');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.type');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.language');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.publisher');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.rights');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.license');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.date');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.creator');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    metaElm = doc.createElement('META');
    metaElm.setAttribute('name', 'dcterms.contributor');
    metaElm.setAttribute('content', '');
    doc.getElementsByTagName('head')[0].appendChild(metaElm);

    // Add additional XML attributes

    scriptElm = doc.createElement('SCRIPT');
    doc.getElementsByTagName('head')[0].appendChild(scriptElm);

    template_attributes_Elm = doc.createElement('template_attributes');
    scriptElm.appendChild(template_attributes_Elm);

    top_level_flag_Elm = doc.createElement('top_level_flag');
    top_level_flag_Elm.textContent = 'true';
    template_attributes_Elm.appendChild(top_level_flag_Elm);

    top_level_flag_Elm = doc.createElement('status');
    top_level_flag_Elm.textContent = 'ACTIVE';
    template_attributes_Elm.appendChild(top_level_flag_Elm);

    top_level_flag_Elm = doc.createElement('user-list');
    top_level_flag_Elm.textContent = '';
    template_attributes_Elm.appendChild(top_level_flag_Elm);

    top_level_flag_Elm = doc.createElement('provider-group-list');
    top_level_flag_Elm.textContent = '';
    template_attributes_Elm.appendChild(top_level_flag_Elm);
}

/**
 * Appends a HTML <textarea> element, not the MRRT <input type="textarea"> element.
 * 
 * @param {type} parentElm
 * @param {type} labelText
 * @param {type} id
 * @returns {undefined}
 */
function appendTextareaChild(parentElm, labelText, id) {
    var teaxtareaElm = parentElm.ownerDocument.createElement('textarea');
    teaxtareaElm.setAttribute('id', id);
    teaxtareaElm.setAttribute('name', labelText);
    teaxtareaElm.setAttribute('data-field-type', 'TEXT');

    var labelElm = parentElm.ownerDocument.createElement('label');
    labelElm.setAttribute('for', id);
    labelElm.textContent = labelText;

    parentElm.appendChild(labelElm);
    parentElm.appendChild(teaxtareaElm);
}
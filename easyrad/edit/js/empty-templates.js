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
 * @date 2017-05-08
 */


/**
 * Sets a new template with no sections in the content.
 * 
 * See MRRT: 8.1 Report Template Structure
 */
function newTemplate() {
    var sectionElm;
    var headerElm;
    var pElm;
    var sectionName;

    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');

    sectionName = i18n('new_template_section_name');
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T001');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T101');

    setTemplateDoc(doc);
}


/**
 * Creates a new template based on the structure defined in DICOM PS3.20
 * "Imaging Reports using HL7​ Clinical Document Architecture"
 */
function newDicom20() {
    var sectionElm;
    var headerElm;
    var pElm;
    var sectionName;

    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');

    sectionName = 'Clinical Information';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T001');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T101');

    sectionName = 'Imaging Procedure Description';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T002');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T102');

    sectionName = 'Comparison Study';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T003');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T103');

    sectionName = 'Findings';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T004');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T104');

    sectionName = 'Impression';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'true');
    sectionElm.setAttribute('id', 'T005');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T105');

    sectionName = 'Addendum';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T006');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T106');

    setTemplateDoc(doc);
}

/**
 * Creates a new template based on the structure defined in DIN25300-1
 * "Prozesse in der Radiologie — Teil 1: Befundung eines bildgebenden oder bildgestützten Verfahrens"
 */
function newDin25300() {
    var sectionElm;
    var headerElm;
    var pElm;
    var sectionName;

    // Not a loaded file
    templateFilename = '';

    // Create a new HTML document
    var doc = document.implementation.createHTMLDocument('');

    sectionName = 'Klinische Angaben';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'true');
    sectionElm.setAttribute('id', 'T001');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T101');

    sectionName = 'Medizinische Fragestellung';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T002');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T102');

    sectionName = 'Befundungs Fragestellung';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T003');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T103');

    sectionName = 'Beschreibung';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T004');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T104');

    sectionName = 'Beurteilung';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'true');
    sectionElm.setAttribute('id', 'T005');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T105');

    sectionName = 'Empfehlung';
    sectionElm = doc.createElement('SECTION');
    sectionElm.setAttribute('data-section-name', sectionName);
    sectionElm.setAttribute('data-section-required', 'false');
    sectionElm.setAttribute('id', 'T006');
    doc.getElementsByTagName('body')[0].appendChild(sectionElm);
    headerElm = doc.createElement('HEADER');
    headerElm.setAttribute('class', 'level1');
    headerElm.textContent = sectionName;
    sectionElm.appendChild(headerElm);
    pElm = doc.createElement('P');
    sectionElm.appendChild(pElm);
    appendTextareaChild(pElm, '', 'T106');

    setTemplateDoc(doc);
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
    teaxtareaElm.setAttribute('data-field-merge-flag', 'false');
    teaxtareaElm.setAttribute('data-field-verbal-trigger', '');
    teaxtareaElm.setAttribute('Value', '');
    teaxtareaElm.setAttribute('data-field-completion-action', 'NONE');
    teaxtareaElm.setAttribute('Title', '');

    var labelElm = parentElm.ownerDocument.createElement('label');
    labelElm.setAttribute('for', id);
    labelElm.textContent = labelText;

    parentElm.appendChild(labelElm);
    parentElm.appendChild(teaxtareaElm);
}
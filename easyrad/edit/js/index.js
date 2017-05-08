/* 
 * EasyRad Editor
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
 * @date 2017-05-05
 */

/*=============================================
 *====      Configuration parameters       ====
 *===========================================*/

/* EasyRad Editor parameter: The URL of the template to edit when opening the editor */
//var easyrad_param_template_to_edit = '../samples/dicom20.html';
var easyrad_param_template_to_edit = '../samples/IHE_MRRT_Example_TI_TH.html';
//var easyrad_param_template_to_edit = 'file:///C:/Users/Tom/Desktop/EasyRad/EasyRadEdit_Project/GitHub/EasyRad/easyrad/samples/IHE_MRRT_Example_TI_TH.html';

/* ========================================= */


/* The template in the editor as a HTML Document object (set before editing starts). */
var templateDoc;


/* The name of the templates file (set if template was loaded from fileystem). */
var templateFilename;


/*
 * Defer the JQuery scripts until the DOM has been completely parsed.
 */
$(document).ready(function () {

    // Test whether all requiered APIs are available in the browser
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
        // Diabale file selection option
        $("#open-btn").prop("disabled", true);
    }

    // TinyMce code plugin: https://www.tinymce.com/docs/plugins/code/
    // HTML5 formats: http://archive.tinymce.com/tryit/3_x/html5_formats.php
    tinymce.init({
        selector: "textarea",
        plugins: "code,visualblocks",
        // toolbar: "code",
        content_css: 'css/content.css',

        // Schema is HTML5 instead of default HTML4
        schema: "html5",

        // End container block element when pressing enter inside an empty block
        end_container_on_empty_block: true,
        visualblocks_default_state: true,

        // HTML5 formats
        style_formats: [
            {title: 'h1', block: 'h1'},
            {title: 'h2', block: 'h2'},
            {title: 'h3', block: 'h3'},
            {title: 'h4', block: 'h4'},
            {title: 'h5', block: 'h5'},
            {title: 'h6', block: 'h6'},
            {title: 'p', block: 'p'},
            {title: 'div', block: 'div'},
            {title: 'pre', block: 'pre'},
            {title: 'section', block: 'section', wrapper: true, merge_siblings: false},
            {title: 'article', block: 'article', wrapper: true, merge_siblings: false},
            {title: 'blockquote', block: 'blockquote', wrapper: true},
            {title: 'hgroup', block: 'hgroup', wrapper: true},
            {title: 'aside', block: 'aside', wrapper: true},
            {title: 'figure', block: 'figure', wrapper: true}
        ],

        // Definition of an event handler called when TinyMce is initialized
        setup: function (editor) {
            editor.on('init', function () {
                // If specified in the parameters: Load a default template to edit
                if ((typeof easyrad_param_template_to_edit !== "undefined") && (easyrad_param_template_to_edit.length > 0)) {
                    loadTemplateDoc(easyrad_param_template_to_edit);
                }
            });
        }
    });


    // Localize the text of the user interface
    localize();


    /**
     * Handles the click of the [NEW] button.
     * 
     * @param e the event
     */
    $('#new-btn').on('click', function () {
        newTemplate();
    });


    /**
     * Handles the click of the [New DICOM 20] button.
     * 
     * @param e the event
     */
    $('#dicom20-btn').on('click', function () {
        newDicom20();
    });


    /**
     * Handles the click of the [New DIN 25300] button.
     * 
     * @param e the event
     */
    $('#din25300-btn').on('click', function () {
        newDin25300();
    });


    /*
     * Loads a new template from the local filesystem.
     * The function presents the user a standard file select dialog to select 
     * the template.
     */
    $('#open-btn').on("change", function handleFileSelect(evt) {
        var files;
        var f;
        var fileReader;

        // Get the FileList object
        files = evt.target.files;

        // We do not use the "multiple" attribute in input
        // Therefore we have only one file
        f = files[0];

        // Only process HTML files.
        if (f.type != "text/html") {
            return;
        }

        // Store the name of the file for later use
        templateFilename = f.name;

        // Lesen von Dateien in JavaScript mit den File APIs
        // See: https://www.html5rocks.com/de/tutorials/file/dndfiles/
        fileReader = new FileReader();

        // Closure to capture the file information.
        fileReader.onload = (function (theFile) {
            return function (e) {
                loadTemplateDoc(e.target.result);
            };
        })(f);

        // Read the file as a data URL.
        fileReader.readAsDataURL(f);

    });


    /**
     * Handles the click of the [?] button.
     * 
     * @param e the event
     */
    $('#get-info-btn').on('click', function () {
        // The header-tag has a z-index = 5003 in the default theme
        // Move the modal dialog before the header
        $('#template-info-modal-dialog').css('z-index', '10000');
        $('#template-info-modal-dialog').modal('show');
    });


    /**
     * Closes the info modal dialog when pressing the X in the dialogs header.
     */
    $('#modal-close-btn-x').on('click', function () {
        $('#template-info-modal-dialog').modal('hide');
    });


    /**
     * Handles the click of the [SAVE] button.
     * 
     * @param e the event
     */
    $('#save-btn').on('click', function () {
        var text;
        var titleElm;
        var filename;

        // Update the document to reflect the edited changes
        updateTemplateDoc();

        // outerHTML() is not supported by InternetExplore. We simulate it
        text = templateDoc.documentElement.innerHTML;
        text = '<html>' + '\n' + text + '\n' + '</html>';
        text = '<!DOCTYPE html>' + '\n' + text;

        // Alternative method: Works, but returns code inside <SCRIPT> element HTML-escaped
        // text = new XMLSerializer().serializeToString(templateDoc);

        if ((typeof templateFilename !== "undefined") && (templateFilename.length > 0)) {
            filename = templateFilename;
        } else {
            // Set the file name
            titleElm = templateDoc.getElementsByTagName('title')[0];
            if ((typeof titleElm !== "undefined") && (titleElm.textContent.length > 0)) {
                filename = titleElm.textContent;
            } else {
                filename = 'Template';
            }
            filename = filename + '.html';

            // Make valid filename: a-z, A-Z, 0-9, . and -
            filename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
        }

        saveTextAsFile(text, filename);
    });

});


/**
 * Set the template in the editor.
 * 
 * @param Document doc the template as a HTML document.
 */
function setTemplateDoc(doc) {
    var inputElms;
    var tryToFindNext;
    var bodyHtml;
    var metaElms;
    var name;
    var xmlDoc;
    var templateAttrElms;
    var xmlScriptElm;
    var dcTermName;
    var dcTermId;
    var attrName;

    // Store the object in global variable
    templateDoc = doc;

    /* Modification of the documents DOM could be done here before putting into the editor */

    // Replace of <input type="textarea"> elements with <textarea>
    // A for loop could not be used because the DOM is modified
    do {
        inputElms = templateDoc.getElementsByTagName('input');
        // By default stop the loop again
        tryToFindNext = false;
        // Test all INPUT elements
        for (var i = 0; i < inputElms.length; i++) {
            if (inputElms[i].getAttribute('type') === 'textarea') {
                // Found a type="textarea" element. Process it
                replaceInputWithTextarea(inputElms[i]);
                // Try to find next
                tryToFindNext = true;
            }
        }
        // No more INPUT type="textarea" elements found
    } while (tryToFindNext);

    /* Setup the content editor */

    bodyHtml = templateDoc.getElementsByTagName('body')[0].innerHTML;

    // We have to update the content of the TinyMce editor. The TEXTAREA is hidden.
    // $('#template-textarea').val(bodyHtml);
    tinymce.activeEditor.setContent(bodyHtml);

    /* Setup the info modal dialog */

    // Remove existing content
    for (var i = 0; i < dcTerms.length; i++) {
        dcTermName = dcTerms[i];
        dcTermId = dcTermName.replace('.', '-');
        // Clear content of <input> element in dialog
        $('#' + dcTermId).val('');
    }
    for (var i = 0; i < templateAttributes.length; i++) {
        attrName = templateAttributes[i];
        // Clear content of <input> element in dialog
        $('#' + attrName).val('');
    }


    // Get all <meta> elements
    metaElms = templateDoc.getElementsByTagName('meta');
    for (var i = 0; i < metaElms.length; i++) {
        name = metaElms[i].getAttribute('name');
        if ((name === null) || (name.length === 0)) {
            continue;
        }
        if (!name.startsWith('dcterms')) {
            continue;
        }
        // Process only elements which start with 'dcterms'
        // Change the attribute name to ID of textarea in dialog
        name = name.replace('.', '-');
        $('#' + name).val(metaElms[i].getAttribute('content'));
    }

    // Get the <script> element containg XML content
    xmlScriptElm = getXmlScriptElm(templateDoc);
    if (xmlScriptElm !== null) {
        // Convert the XML <script> element into a XML document.
        xmlDoc = xmlScriptToXmlDoc(xmlScriptElm);

        // Extract the template attribute information from the XML document
        for (var k = 0; k < templateAttributes.length; k++) {
            templateAttrElms = xmlDoc.getElementsByTagName(templateAttributes[k]);
            if (templateAttrElms.length > 0) {
                $('#' + templateAttributes[k]).val(templateAttrElms[0].textContent);
            }
        }
    }
}


/**
 * Updates the template HTML document to reflect the edited changes in the content 
 * editor and the info dialog.
 */
function updateTemplateDoc() {
    var dcTermName;
    var dcTermId;
    var dcTermVal;
    var xmlScriptElm;
    var xmlDoc;
    var templateAttributesElms;
    var templateAttributesElm;
    var attrElms;
    var attrElm;
    var attrVal;
    var serializer;
    var xml;
    var rootChildElms;
    var textareaElms;

    /* Update changes by the content editor */

    // Replace documents body with the content of the editor
    var bodyHtml = tinyMCE.activeEditor.getContent();
    templateDoc.body.innerHTML = bodyHtml;

    /* Update changes of the info dialog */

    for (var i = 0; i < dcTerms.length; i++) {
        dcTermName = dcTerms[i];
        dcTermId = dcTermName.replace('.', '-');
        // Get content of <input> element in dialog
        dcTermVal = $('#' + dcTermId).val();
        updateDcTerm(dcTermName, dcTermVal);
    }

    // Get/create a XML script element
    xmlScriptElm = getXmlScriptElm(templateDoc);
    if (xmlScriptElm === null) {
        xmlScriptElm = templateDoc.createElement('SCRIPT');
        xmlScriptElm.setAttribute('type', 'text/xml');
        templateDoc.head.appendChild(xmlScriptElm);

    }
    // Convert the script elements content to a XML document
    xmlDoc = xmlScriptToXmlDoc(xmlScriptElm);

    // Get/create <template_attributes> element
    templateAttributesElms = xmlDoc.getElementsByTagName('template_attributes');
    if (templateAttributesElms.length === 0) {
        templateAttributesElm = xmlDoc.createElement('template_attributes');
        xmlDoc.documentElement.appendChild(templateAttributesElm);
    } else {
        templateAttributesElm = templateAttributesElms[0];
    }

    // Process all template attributes
    for (var i = 0; i < templateAttributes.length; i++) {
        // Get the edited value
        attrVal = $('#' + templateAttributes[i]).val();

        attrElms = xmlDoc.getElementsByTagName(templateAttributes[i]);
        if (attrElms.length === 0) {
            // Not defined, crete new element
            attrElm = xmlDoc.createElement(templateAttributes[i]);
            attrElm.textContent = attrVal;
            templateAttributesElm.appendChild(attrElm);
        } else {
            // Update (first) existing element
            attrElms[0].textContent = attrVal;
        }
    }

    // Get the XML text
    serializer = new XMLSerializer();
    rootChildElms = xmlDoc.documentElement.children;
    xml = '';

    for (var i = 0; i < rootChildElms.length; i++) {
        xml = xml + serializer.serializeToString(rootChildElms[i]) + '\n';
    }
    xml = xml.trim();

    // Update the XML script content
    xmlScriptElm.textContent = xml;

    /* Modification of the documents DOM could be done here */

    // Replace <textarea> elements with <input type="textarea">
    // for loop could not be used because the DOM is modified
    while (templateDoc.getElementsByTagName('textarea').length > 0) {
        replaceTextareaWithInput(templateDoc.getElementsByTagName('textarea')[0]);
    }
}


/**
 * Updates a single Dublin Core Metadata Element in the templates HTML document.
 * 
 * @param String dcTermName The name of the Dublin Core Metadata Element
 * @param String dcTermVal The value of the Dublin Core Metadata Element
 */
function updateDcTerm(dcTermName, dcTermVal) {
    var metaElms;
    var name;
    var metaElm;

    // Prepare the new <meta> element
    metaElm = templateDoc.createElement('META');
    metaElm.setAttribute('name', dcTermName);
    metaElm.setAttribute('content', dcTermVal);

    // Get <meta> elements
    metaElms = templateDoc.getElementsByTagName('META');
    for (var i = 0; i < metaElms.length; i++) {
        name = metaElms[i].getAttribute('name');
        if ((name === null) || (name.length === 0)) {
            continue;
        }
        if (name !== dcTermName) {
            continue;
        }

        // Found in templateDoc, replace with new content
        metaElms[i].parentNode.replaceChild(metaElm, metaElms[i]);
        return;
    }

    // Not found in templateDoc, add new element
    templateDoc.head.appendChild(metaElm);
}


/**
 * Loads a template file from a given URL.
 * The function calls setTemplateDoc(doc) as a call back when loading has 
 * finished (asynchrone).
 * 
 * @param url The URL of the template
 */
function loadTemplateDoc(url) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', url);
    xhttp.onreadystatechange = function () {
        // State = 4 => DONE
        if (this.readyState == 4) {
            switch (this.status) {
                // HTTP result code 200 => OK
                case 200:
                    // Create a new HTML documnet
                    var doc = document.implementation.createHTMLDocument('');
                    // Set the documents content to the HTML root element specified in the URL
                    doc.documentElement.innerHTML = xhttp.responseText;
                    // Setup the template editor
                    setTemplateDoc(doc);
                    break;

                default:
                    // Display the HTTP result code and text
                    alert('Error code: ' + this.status + ' - ' + this.statusText);
            }
        }
    }
    xhttp.send();
}



/**
 * Localizes the text of the user interface to the language used by the browser.
 */
function localize() {
    $("#new-btn").html(i18n('new_btn'));
    $("#dicom20-btn").html(i18n('dicom20_btn'));
    $("#din25300-btn").html(i18n('din25300_btn'));

    $("#open-btn").filestyle('buttonText', i18n('open_btn'));
    $("#get-info-btn").html(i18n('get_info_btn'));
    $("#save-btn").html(i18n('save_btn'));

    // Set in function loadTemplateDoc(url) for each template loaded
    // $("#template-title").html(i18n('template_title'));
    // $("#template-publisher").html(i18n('template_publisher'));

    $("#modal-title-text").text(i18n('modal_title_text'));
}

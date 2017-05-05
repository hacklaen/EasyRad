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
 * @date 2017-05-02
 */

/*
 * Chrome Browsers do not allow cross origin requests for local files. If you load
 * this file in Chrome, the following exception is thrown:
 * "Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
 * Besides using another browser, like Firefox, using a lokal server would be work around:
 * See: http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht
 * The recommended local server as a Chrome extension "Web Server for Chrome" is an open source (MIT) HTTP server for Chrome:
 * Link: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en
 */

/* EasyRad parameter: The URL of the teplate to edit */
var easyrad_param_template_to_edit = '../samples/IHE_MRRT_Example_TI_TH.html';
//var easyrad_param_template_to_edit = 'file:///C:/Users/Tom/Desktop/EasyRad/EasyRadEdit_Project/GitHub/EasyRad/easyrad/samples/IHE_MRRT_Example_TI_TH.html';


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

/* The template in the editor as a Documnet object (set before editing starts). */
var templateDoc;

/* The name of the templates file (set if loaded from fileystem). */
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
 * 
 * @param Document doc
 */
function setTemplateDoc(doc) {
    var bodyHtml;
    var metaElms;
    var name;
    var scriptElms;
    var parser;
    var xml;
    var xmlDoc;
    var templateAttrElms;
    var dcTermName;
    var dcTermId;
    var attrName;

    /* Modification of the documents DOM could be done here before putting into the editor */

    // E.g. replacement of <input type="textarea"> elements by <textarea>

    // Store the object in global variable
    templateDoc = doc;

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

    // Get template attributes
    scriptElms = templateDoc.getElementsByTagName('script');
    for (var i = 0; i < scriptElms.length; i++) {
        if (scriptElms[i].getAttribute('type') !== 'text/xml') {
            continue;
        }

        // Convert the content of the <script> element into an XML document
        xml = scriptElms[i].textContent;
        // Create a valid XML structure
        xml = '<?xml version="1.0" encoding="UTF-8"?> <root> ' + xml + ' </root>';
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml, "text/xml");

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
 * Updates the document to reflect the edited changes in the content editor and the info dialog.
 */
function updateTemplateDoc() {
    var dcTermName;
    var dcTermId;
    var dcTermVal;

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

    for (var i = 0; i < templateAttributes.length; i++) {

    }

    /* Modification of the documents DOM could be done here */

    // E.g. replacement of <textarea> elements by <input type="textarea">
}


/**
 * 
 * @param {type} dcTermName
 * @param {type} dcTermVal
 * @returns {undefined}
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
 * Link: https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
 * 
 * @param {type} textToSave
 * @param {type} fileNameToSaveAs
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
 * 
 * @param {type} event
 */
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

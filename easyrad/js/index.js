/* 
 * EasyRad
 *
 * This browser application allows to fill out MRRT templates and copy the result
 * into the clipboard.
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
 * Chrome Browsers do not allow cross origin requests for local files. If you load
 * this file in Chrome, the following exception is thrown:
 * "Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
 * Besides using another browser, like Firefox, using a lokal server would be work around:
 * See: http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht
 * The recommended local server as a Chrome extension "Web Server for Chrome" is an open source (MIT) HTTP server for Chrome:
 * Link: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en
 *
 * @version 1.0
 * @author T. Hacklaender
 * @date 2017-04-19
 */

var clipboard;

/*
 * Defer the JQuery scripts until the DOM has been completely parsed.
 */
$(document).ready(function () {

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
        // Diabale all file selection options
        $("#files").prop("disabled", true);
    }

    // Load sample data
    loadTemplate('./samples/IHE_MRRT_Example_TI_TH.html');

    // Build list of favored templates
    setupFavoredTemplates();

    // Create a new clipboard object
    clipboard = new Clipboard('#to-clipboard-btn', {
        text: function (trigger) {
            // Convert the HTML content to formatted TEXT
            var myFrameText = convert($('#template-html'));
            // Log to console (for debugging)
            console.log(myFrameText);
            // Put the formatted TEXT into the clipboard
            return myFrameText;
        }
    });

    /*
     * Handler for the 'success' event of the clipboard
     */
    clipboard.on('success', function (e) {
        // console.info('Action:', e.action);
        // console.info('Text:', e.text);
        // console.info('Trigger:', e.trigger);

        e.clearSelection();
    });

    /**
     * Nothing to do in the moment
     */
    clipboard.on('error', function (e) {
        // Nothing to do in the moment
        // console.error('Action:', e.action);
        // console.error('Trigger:', e.trigger);
    });

    /*
     * Lesen von Dateien in JavaScript mit den File APIs
     * See: https://www.html5rocks.com/de/tutorials/file/dndfiles/
     */
    $('#files').on("change", function handleFileSelect(evt) {
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

        fileReader = new FileReader();

        // Closure to capture the file information.
        fileReader.onload = (function (theFile) {
            return function (e) {
                loadTemplate(e.target.result);
            };
        })(f);

        // Read the file as a data URL.
        fileReader.readAsDataURL(f);

    });


    /**
     * Handles the selection of the load menu-button in each row.
     * 
     * @param e the event
     */
    $('.load-btn').on("click", function () {
        var url = $(this).data("url");
        loadTemplate(url);
    })

    /**
     * 
     * @param {type} url
     * @returns {undefined}
     */
    function loadTemplate(url) {
        var title;
        var dcterms;

        // When loading templates in the Netbeans environment using the 
        // "Embedden Lightweight" server and Chrow as a browser the requested 
        // character encoding (e.g. utf-8) of the loaded page is not recognized.
        // The page is loaded with a "default" charset.
        // Even overriding this default with the following advise does not help:
        // See: http://stackoverflow.com/questions/12272653/jquery-load-method-charset
        // $.ajaxSetup({
        //     'beforeSend': function (xhr) {
        //         xhr.overrideMimeType('text/html; utf-8');
        //     },
        // });
        // Using Mozilla Firefox as a browser works fine!

        // Load the new template
        $("#template-html").load(url, function () {
            // Function is executed afer completition of load

            // Replace <input type="textarea" /> with a TEXTAREA tags
            $("input[type='textarea']").replaceWith(function () {
                return $("<textarea/>", {// JQuery object-literal
                    name: this.name,
                    "data-field-type": $(this).attr("data-field-type"),
                    "data-field-merge-flag": $(this).attr("data-field-merge-flag"),
                    "data-field-verbal-trigger": $(this).attr("data-field-verbal-trigger"),
                    "data-field-completion-action": $(this).attr("data-field-completion-action"),
                    "Title": $(this).attr("Title"),
                    id: this.id,
                }).val($(this).val());
            });

            // Get the title of the template
            title = $('#template-html').find("title").text();
            // Display the title of the template
            $('#template-title').text("Template: " + title)

            dcterms = getDcterms();
            // Display the publisher of the template
            $('#template-publisher').text("Publisher: " + dcterms['publisher']);

        });
    }


    /**
     * Handles the click of the [Details] menu-button in each row of the file list.
     * 
     * @param e the event
     */
    $('#get-details-btn').on('click', function () {
        setupInfoTable();
        // The header-tag has a z-index = 5003 in the default theme
        // Move the modal dialog before the header
        $('#template-info-modal-dialog').css('z-index', '10000');
        $('#template-info-modal-dialog').modal('show');
    });

    /**
     * Closes the details-modal dialog when pressing the X in the dialogs header.
     */
    $('#modal-close-btn-x').on('click', function () {
        $('#template-info-modal-dialog').modal('hide');
    });

    /**
     * Closes the details-modal dialog when pressing the close button in the dialogs footer.
     */
    $('#modal-close-btn').on('click', function () {
        $('#template-info-modal-dialog').modal('hide');
    });
});

/**
 * Gets the dcterms defined in the meta tags of the template.
 * 
 * @returns Object containing the dcterms as properties (keys) and their content as values.
 */
function getDcterms() {
    var dcterms = new Array();

    // Get the dcterms defined in the meta tags of the template
    var metaElms = $('meta[name^="dcterms."]');

    for (var i = 0; i < metaElms.length; i++) {
        var key = metaElms[i].name;
        // Remove leading 'dcterms.
        key = key.substr(8);
        dcterms[key] = metaElms[i].content;
    }

    return dcterms;
}


/**
 * Builds the table rows of the #info-table in the modal dialog displaying the
 * infos about the template.
 */
function setupInfoTable() {
    var content;
    var upper;
    var dcterms = getDcterms();

    // JavaScript does not know associative arrays. Instead properties of an object are used.
    // See: http://stackoverflow.com/questions/8312459/iterate-through-object-properties
    Object.keys(dcterms).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        content += "<tr>";
        content += "<td>";
        // Capitalize first character
        upper = key.toLowerCase().replace(/\b[a-z]/g, function (letter) {
            return letter.toUpperCase();
        });
        content += upper;
        content += "</td>";
        content += "<td>";
        content += dcterms[key];
        content += "</td>";
        content += "</tr>";
    });

    $('#info-table').empty();
    $('#info-table').append(content);
}

/**
 * 
 * @returns {undefined}
 */
function setupFavoredTemplates() {
    var fileDesc;
    var content = "";

    if (typeof favoredTemplates === 'undefined') {
        $("#favored-templates-btn").attr("disabled", "true");
        return;
    } else {
        $("#favored-templates-btn").removeAttr("disabled");
    }

    for (var i = 0, len = favoredTemplates.length; i < len; i++) {
        fileDesc = favoredTemplates[i];
        content += "<li data-url='" + fileDesc[1] + "'>";
        content += '<a class="btn btn-default load-btn" ' + 'data-url="' + fileDesc[1] + '">';
        content += fileDesc[0];
        content += "</a>";
        content += "</li>";
    }

    $('#favored-templates-list').empty();
    $('#favored-templates-list').append(content);
}
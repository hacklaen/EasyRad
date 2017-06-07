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
 * @version 1.4
 * @author Thomas Hacklaender
 * @date 2017-06-02
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


/*=============================================
 *====      Configuration parameters       ====
 *===========================================*/

/* EasyRad parameter: The URL of the template display when opening the report creator */
var param_template = '';
//var param_template = './samples/IHE_MRRT_Example_TI_TH.html';
//var param_template = './samples/IHE_MRRT_Example_TI_TH_content_only.html';
//var param_template = './templates/us_fast.html';

/* EasyRad parameter: If true, the UI elements to select a new template are hidden. */
var param_hide_selection = false;


/* ========================================= */

/* The clipboard object */
var clipboard;

/* The URL of the actual loaded template file. Set by function loadT emplate. Relative URLs are specified relative to index.html. */
var loadedTemplateUrl = '';

/* An array containing the hrefs of all link elements originally specified in EasyRad */
var originalLinks;


/* Update the configuration parameter from the URL */
getAtts(location.search);


/*
 * Defer the JQuery scripts until the DOM has been completely parsed.
 */
$(document).ready(function () {

    // Sets the global variable originalLinks which contains the hrefs of all link 
    // elements originally specified in EasyRad. 
    getOriginalLinks();

    // Test whether all requiered APIs are available in the browser
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
        // Diabale all file selection options
        $("#files").prop("disabled", true);
    }

    if (!Clipboard.isSupported()) {
        alert('The Clipboard APIis not supported in this browser.');
        // Diabale copy to clipboard button
        $("#to-clipboard-btn").prop("disabled", true);
    }

    // Localize the text of the user interface
    localize();

    // Build list of favored templates
    setupFavoredTemplates();

    // Setup user interface
    if ((typeof param_hide_selection !== "undefined") && (param_hide_selection)) {
        $("#favored-templates-btn").hide();
        $("#files-div").hide();
    }

    // Load sample data
    if ((typeof param_template !== "undefined") && (param_template.length > 0)) {
        loadTemplate(param_template);
    }

    /*
     *  Create a Clipboard object.
     */
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
     * Callback handler of the Clipboard object:
     * Handles the 'success' event of the clipboard
     */
    clipboard.on('success', function (e) {
        // console.info('Action:', e.action);
        // console.info('Text:', e.text);
        // console.info('Trigger:', e.trigger);

        // Clear the selection
        e.clearSelection();
    });


    /**
     * Callback handler of the Clipboard object:
     * Handles the 'error' event of the clipboard
     */
    clipboard.on('error', function (e) {
        // Nothing to do in the moment
        // console.error('Action:', e.action);
        // console.error('Trigger:', e.trigger);
    });


    /*
     * Loads a new template from the local filesystem.
     * The function presents the user a standard file select dialog to select 
     * the template.
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

        // Lesen von Dateien in JavaScript mit den File APIs
        // See: https://www.html5rocks.com/de/tutorials/file/dndfiles/
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
     * Handles the selection of the load menu-button in each row of the favored 
     * templates drop down.
     * 
     * @param e the event
     */
    $('.load-btn').on("click", function () {
        var url = $(this).data("url");
        loadTemplate(url);
    })



    /**
     * Handles the click of the [?] button.
     * 
     * @param e the event
     */
    $('#get-info-btn').on('click', function () {
        setupInfoTable();
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

    /*
     * A general event handler for select elements, which are children of #template-html
     */
    $('#template-html').on('change', 'select', function (e) {
        var optionSelected = $(this).find('option:selected');
        var templateUidAttr = optionSelected.attr('data-template-UID');
        
        // Process option elements with an 'data-template-UID' attribute set
        // (options which trigger an embed of a template)
        if (templateUidAttr) {
            var templateUid = optionSelected.attr('data-template-UID');
            var replacementElementId = optionSelected.attr('data-replacement-element-id');
            var elm = $("#" + replacementElementId);
            var srcFileName = templateUid + ".html";
            // Replace the element specified in the option element with the specified template
            replaceElm(elm, srcFileName);
        }
    });


    /**
     * Loads a template file from a given URL.
     * 
     * @param url The URL of the template
     */
    function loadTemplate(url) {
        var title;
        var dcterms;

        // Remove all link elements included by the already loaded templates
        removeTeplateLinks();

        // Store the URL in global variable
        loadedTemplateUrl = url;

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
        // From the loaded HTML document the <html>, <head> and <body> elements 
        // were automatically removed.
        // The child elements of <head> and <body> are inserted in the sequence 
        // of appearing in the origibnal file
        $("#template-html").load(url, function (response, status, xhr) {
            // Function is executed after completition of load

            // Modify the loaded template
            modifyLoadedTemplate($("#template-html"), loadedTemplateUrl);

            // Process <embed> elements
            $("#template-html").find("embed").each(function (index) {
                replaceEmbedElm($(this));
            });


            // Get the title of the template
            title = $('#template-html').find("title").text();
            // Display the title of the template
            $('#template-title').text(i18n('template_title'));
            $('#template-title-value').text(title);

            dcterms = getDcterms();
            // Display the publisher of the template
            $('#template-publisher').text(i18n('template_publisher'));
            $('#template-publisher-value').text(dcterms['publisher']);
        });
    }

    /**
     * Replaces an <embed> element with a <div> element containing the loaded 
     * template as its children.
     * 
     * @param embedElm The <embed> element to be replaced.
     */
    function replaceEmbedElm(embedElm) {
        var srcFileName;

        // Embedded file must be HTML
        if (embedElm.attr("type") !== "text/html") {
            // Other file type: Nothing to do
            return;
        }

        // Get the name of the template to embed
        srcFileName = embedElm.attr("src");

        // Replace the embed element
        replaceElm(embedElm, srcFileName);
    }


    /**
     * Replaces an element with a <div> element containing the loaded 
     * template as its children.
     * 
     * @param elm The element to be replaced.
     * @param srcFileName The name of the template file to embed
     */
    function replaceElm(elm, srcFileName) {
        var divElm;
        var embedSrcUrl;

        // Create a new <div> element
        divElm = document.createElement("DIV");

        // Replace the <embed> element with the new <div>
        $(elm).replaceWith(divElm);

        // Get the URL of the embedded file relative to index.html
        if (typeof EMBED_DIRECTORY_URL === 'string' && EMBED_DIRECTORY_URL.length) {
            if (isAbsoluteUrl(EMBED_DIRECTORY_URL)) {
                embedSrcUrl = EMBED_DIRECTORY_URL;
                if (!embedSrcUrl.endsWith('/')) {
                    embedSrcUrl += "/";
                }
                embedSrcUrl += srcFileName;
            } else {
                embedSrcUrl = removeFileName(loadedTemplateUrl) + EMBED_DIRECTORY_URL;
                if (!embedSrcUrl.endsWith('/')) {
                    embedSrcUrl += "/";
                }
                embedSrcUrl += srcFileName;
            }
        } else {
            // EMBED_DIRECTORY_URL is not specified. Use the directory of the embedding template as a default.
            embedSrcUrl = removeFileName(loadedTemplateUrl) + srcFileName;
        }

        // Load the content of the embedded template as children of the <div>
        // From the loaded HTML document the <html>, <head> and <body> elements 
        // were automatically removed.
        // The child elements of <head> and <body> are inserted in the sequence 
        // of appearing in the origibnal file
        $(divElm).load(embedSrcUrl, function (response, status, xhr) {
            // Function is executed after completition of load

            // Modify the loaded template
            modifyLoadedTemplate(divElm, embedSrcUrl);

            // Process <embed> elements in the embedded template
            $(divElm).find("embed").each(function (index) {
                replaceEmbedElm($(this));
            });
        });
    }

});


/**
 * Modifies a loaded template:
 * - Adapt relative links of <img> and <link> elements.
 * - Replace <input type="textarea"> elements with <textarea> elements.
 * 
 * @param baseElm JQuery object containing the loaded template as child elements.
 * @param {string} templateFileUrl The URL of the template file. Relative URLs 
 *                 must be specified relative to index.html.
 */
function modifyLoadedTemplate(baseElm, templateFileUrl) {

    // Move <link> into head part of index.html and correct the relative link
    $(baseElm).find("link").each(function (index) {
        // Move to head element
        $("head").append($(this));

        var hrefUrl = $(this).attr("href");
        if (!isAbsoluteUrl(hrefUrl)) {
            // Change the path from relative to template file to relative to index.html
            $(this).attr("href", removeFileName(templateFileUrl) + hrefUrl);
        }
    });

    // For <img> elemnts: Change the path from relative to file to relative to index.html
    $(baseElm).find("img").each(function (index) {
        var srcUrl = $(this).attr("src");
        if (!isAbsoluteUrl(srcUrl)) {
            // Change the path from relative to template file to relative to index.html
            $(this).attr("src", removeFileName(templateFileUrl) + srcUrl);
        }
    });

    // Replace <input type="textarea" /> with a TEXTAREA tags
    $(baseElm).find("input[type='textarea']").replaceWith(function () {
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
}


/**
 * Tests, whether a given URL is absolute.
 * 
 * @param {String} url The URL to test
 * @returns {Boolean} True, if the given URL is absolute.
 */
function isAbsoluteUrl(url) {
    try {
        // Throws exception for relative URLs
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Removes the filename from a given URL.
 * 
 * @param {string} url The URL of a file.
 * @returns {string} The URL without the filename (either absolute or relative URL).
 *                   If the given URL was a relative URL containing a filename only
 *                   an empty string is returned.
 */
function removeFileName(url) {
    var str = "";
    var urlParts = url.split('/');
    if (urlParts.length > 1) {
        for (var i = 0; i < urlParts.length - 1; i++) {
            str += urlParts[i] + '/';
        }
    }
    return str;
}


/**
 * Get configuration parameter from the URL.
 * 
 * @author Marian Feiler - urbanstudio GmbH
 * @author Thomas Hacklaender
 * @date 2017-05-23
 * 
 * @param {string} querystring URL parameter
 */
function getAtts(querystring) {
    if (querystring === '')
        return;
    var qs = querystring.slice(1);
    var pairs = qs.split("&");
    var pair, key, val;
    for (var i = 0; i < pairs.length; i++) {
        pair = pairs[i].split("=");
        key = unescape(pair[0]).replace("+", " ");
        val = unescape(pair[1]).replace("+", " ");
        if (key === "tpl") {
            param_template = val;
        }
        if (key === "hide") {
            param_hide_selection = (val === '1' ? true : false);
        }
    }
}


/**
 * Gets the dcterms defined in the meta tags of the included template.
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
 * Gets the template attributes defined in the <script type="text/xml"> tag of the included template.
 * 
 * @returns Object containing the template attributes (keys) and their content as values.
 */
function getTemplateAttributes() {
    var xmlScriptElm;
    var xmlDoc;
    var templateAttrElms;
    var key;

    var templateAttrs = new Array();

    // Get the <script> element containg XML content
    xmlScriptElm = getXmlScriptElm(document);
    if (xmlScriptElm !== null) {
        // Convert the XML <script> element into a XML document.
        xmlDoc = xmlScriptToXmlDoc(xmlScriptElm);

        // Extract the template attribute information from the XML document
        for (var i = 0; i < templateAttributes.length; i++) {
            templateAttrElms = xmlDoc.getElementsByTagName(templateAttributes[i]);
            if (templateAttrElms.length > 0) {
                key = templateAttributes[i];
                // Replace '-' in name with space
                key = key.replace('-', ' ');
                templateAttrs[key] = templateAttrElms[0].textContent;
            }
        }
    }

    return templateAttrs;
}


/**
 * Sets up the drop down list of favored templates.
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


/**
 * Builds the table rows of the #info-table in the modal dialog displaying the
 * infos about the template.
 */
function setupInfoTable() {
    var content;
    var upper;
    var dcterms;
    var templateAttrs;

    /* Setup the Dublin Core Metadata Elements */

    dcterms = getDcterms();

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

    /* Setup the template attributes */

    templateAttrs = getTemplateAttributes();

    Object.keys(templateAttrs).forEach(function (key, index) {
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
        content += templateAttrs[key];
        content += "</td>";
        content += "</tr>";
    });

    $('#info-table').empty();
    $('#info-table').append(content);
}


/**
 * Localizes the text of the user interface to the language used by the browser.
 */
function localize() {
    $("#favored-templates-btn").html(i18n('favored_templates_btn'));
    $("#files").filestyle('buttonText', i18n('files_button_text'));
    $("#get-info-btn").html(i18n('get_info_btn'));
    $("#to-clipboard-btn").html(i18n('to_clipboard_btn'));

    // Set in function loadTemplate(url) for each template loaded
    // $("#template-title").html(i18n('template_title'));
    // $("#template-publisher").html(i18n('template_publisher'));

    $("#modal-title-text").text(i18n('modal_title_text'));
}


/**
 * Sets the global variable originalLinks which contains the hrefs of all link 
 * elements originally specified in EasyRad. 
 */
function getOriginalLinks() {
    originalLinks = [];

    $("head").find("link").each(function (index) {
        originalLinks.push($(this).attr("href"));
    });
}

/**
 * Removes all link elements included by templates. 
 */
function removeTeplateLinks() {
    var hasReplaced = false;

    // Process all link elements
    do {
        $("head").find("link").each(function (index) {
            if (originalLinks.indexOf($(this).attr("href")) < 0) {
                $(this).remove();
            }
        });
    } while (hasReplaced);
}
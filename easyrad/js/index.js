/* 
 * EasyRad
 *
 * This browser application allows to fill out MRRT templates and copy the result
 * into the clipboard.
 * 
 * Copyright (C) 2018  IFTM Institut für Telematik in der Medizin GmbH
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
 * Compatibility with browser to copy to clipboard:
 *   - Chrome 42+
 *   - Firefox 41+
 *   - Opera 29+
 *   - Internet Explorer 9+ (text only)
 *   - Edge
 *   - Desktop Safari 10+
 *   - iOS Safari 10+ (text only)
 *  
 *  Firefox portable:
 *  Link: https://portableapps.com/de/apps/internet/firefox_portable
 *  
 *  Chrome Version 66.0.3359.181:
 *  jquery-3.2.0.js:9557 Failed to load file:///D:/Tom/EasyRad/EasyRad_Project/GitHub/EasyRad/easyrad/templates/samples/sample-valid.html: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
 *  
 *  
 *  Internet Explorer 11.0.9600 - EasyRad auf Server:
 *  Beim Laden des Beispielfiles: jquery-3.2.0.js:3869 Das Objekt unterstützt die Eigenschaft oder Methode "startsWith" nicht
 *  
 *  NOTE:
 *  JQuery load:
 *  Due to browser security restrictions, most "Ajax" requests are subject to the 
 *  same origin policy; the request can not successfully retrieve data from a 
 *  different domain, subdomain, port, or protocol. 
 *  Link: https://en.wikipedia.org/wiki/Same-origin_policy
 *  
 * Chrome Browsers do not allow cross origin requests for local files. If you load
 * this file in Chrome, the following exception is thrown:
 * "Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
 * Besides using another browser, like Firefox, using a lokal server would be work around:
 * See: http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht
 * The recommended local server as a Chrome extension "Web Server for Chrome" is an open source (MIT) HTTP server for Chrome:
 * Link: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en
 *
 * How to Disable Same Origin Policy on Chrome and IE browser
 *  Link: https://www.thegeekstuff.com/2016/09/disable-same-origin-policy/
 *  
 *  
 * @version 2.0.0
 * @author Thomas Hacklaender
 * @date 2018-06-08
 */

/*=============================================
 *====      Configuration parameters       ====
 *===========================================*/

/* EasyRad parameter: The URL of the template display when opening the report creator.
 * Can be set with the URL parameter "tpl".                                             */
//var param_template = '';
var param_template = 'templates/samples/sample-valid.html';
//var param_template = 'templates/samples/ct-schaedel.html';
//var param_template = 'templates/samples/din25300.html';
//var param_template = 'templates/samples/IHE_MRRT_Example_TI_TH.html';
//var param_template = 'templates/samples/IHE_MRRT_Example_TI_TH_content_only.html';
//var param_template = 'templates/drg/CT-Thorax_Lungenembolie.html';

/* EasyRad parameter: If true, the UI elements to select a new template are hidden.
 * Can be set with the URL parameter "hide".                                          */
var param_hide_selection = false;


/* EasyRad parameter: Absolute URL of the directory where local template files 
 * (including referenced files) reside. The base directory of EasyRad, ie. the
 *  directory where index.html resides, MUST be in the path of the specified directory. 
 * Can be set with the URL parameter "path".                                          */
var param_local_templates_path = LOCAL_TEMPLATES_PATH;


/* ========================================= */

/* The URL of the actual loaded template file.
 * Set by function loadTemplate.
 * Relative URLs are specified relative to index.html.
 * Sample URLs: If index.html is loaded as file:
 *   - Selection from drop-down list: samples/sample-valid.html
 *   - File selction button:          blob:null/f9c49663-7a11-4f36-b94d-d2b15d5146a7
 * Sample URLs: If index.html is loaded from server:
 *   - Selection from drop-down list: samples/sample-valid.html
 *   - File selction button:          blob:http://localhost:8383/33536f1c-79a6-4184-930b-42f92b1fc73a
 */
var baseTemplateURL = "";

/* The URL of the template which is actual recursive processed after loading a new template.
 * Either relative or absolute. */
var actualProcessedTemplateURL = "";

/* The URL of the template which has embedded the actual processed template (templates may be nested).
 * Either relative or absolute. */
var embeddingTemplateURL = "";

/* An array containing the hrefs of all link elements originally specified in EasyRad */
var originalLinks;

/* The absolute URL of the directory in which this file (e.g. EasyRad's index.html) resides */
/* Sample if loaded from file: file:///D:/Tom/EasyRad/EasyRad_Project/GitHub/EasyRad/easyrad/ */
/* Sample if loaded from server: http://localhost:8383/ReportCreator/ */
var baseDirURL;

/* Update the configuration parameter from the URL */
getUrlParameter(location.search);


/*
 * Defer the JQuery scripts until the DOM has been completely parsed.
 */
$(document).ready(function () {

    // Get URL of the directory of current window
    baseDirURL = window.location.href;

    // Remove optional query part of the URL
    var idx = baseDirURL.indexOf("?");
    if (idx > -1) {
        baseDirURL = baseDirURL.substring(0, idx);
    }

    // Remove the filename
    baseDirURL = removeFilename(baseDirURL);

    // Append a base-element with URL of the directory of current window to head
    var base = $('<base href="' + baseDirURL + '">');
    $("head").append(base);

//    // Log the URL of the base directory
//    console.info("document.ready > baseDirURL: " + baseDirURL);

    // If EasyRad is loaded from a server, file selction of local files is not possible
    if (baseDirURL.startsWith("file:")) {
        $("#files-div").show();
    } else {
        $("#files-div").hide();
    }

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

    if (!document.queryCommandSupported("copy")) {
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


    /**
     * Handles the selection of the to clipboard menu-button in each row of the favored 
     * templates drop down.
     * Uses the library "clipboard-polyfill": https://github.com/lgarron/clipboard-polyfill
     * The library is based on the deprecated lib "clipboard-js": https://www.npmjs.com/package/clipboard-js
     * Another lirary, called "clipboard.js", uses TEXT only: https://clipboardjs.com/
     * 
     * The text/html content of the clipboard is as follows:
     * Version:0.9
     * StartHTML:00000097
     * EndHTML:00009463
     * StartFragment:00000131
     * EndFragment:00009427
     * <html>
     *      <body>
     *          <!--StartFragment-->
     *          <!-- Version: 2017-06-07 -->
     *          ... template content goes here ...
     *          <!--EndFragment-->
     *      </body>
     * </html> 
     */
    $('#to-clipboard-btn').on("click", function () {

        var jqTemplateHtmlElms = $('#template-html');
        // Get the native DOM element from the JQuery element:
        // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/ 
        var templateHtmlElm = jqTemplateHtmlElms[0];
        var templateHtml = convertToHtml(templateHtmlElm);
        var templateText = convertToText(templateHtml);

        var dt = new clipboard.DT();

        switch (CLIPBOARD_TYPE) {
            case 'HTML':
                // Put HTML formatted rich text to clipboard
                dt.setData("text/html", templateHtml.innerHTML);
                break;

            case 'TEXT':
                // Put plain text into the clipboard
                dt.setData("text/plain", templateText);
                break;

            case 'BOTH':
            default:
                // Put HTML formatted rich text to clipboard
                dt.setData("text/html", templateHtml.innerHTML);
                // Put plain text into the clipboard
                dt.setData("text/plain", templateText);
                break;


        }
        clipboard.write(dt);
    });


    /*
     * Loads a new template from the local filesystem.
     * The function presents the user a standard file select dialog to select 
     * the template.
     * 
     * Link: 
     */
    $('#files').on("change", function handleFileSelect(evt) {
        var files;
        var f;
        var fileURL;

        // Get the FileList object
        files = evt.target.files;

        // We do not use the "multiple" attribute in input
        // Therefore we have only one file
        f = files[0];

        // Only process HTML files.
        if (f.type != "text/html") {
            window.alert("Selected file is not a HTML file: " + f.name + " type: " + f.type);
            return;
        }

        // Read local files with the File API
        // Link: https://www.creativebloq.com/web-design/read-local-files-file-api-121518548

        // Create a pseudo URL for accessing the file content, e.g.:
        // blob:null/4858f604-5612-4d92-a7b9-cc54af09f7ee
        // blob:http://localhost:8383/298ebb95-d54a-49e6-938b-58a82b2e651b
        // See: https://www.w3.org/TR/FileAPI/#url
        // See: https://stackoverflow.com/questions/30864573/what-is-a-blob-url-and-why-it-is-used
        fileURL = window.URL.createObjectURL(f);

//        console.info("$('#files').on > f.name: " + f.name);
//        console.info("$('#files').on > f.type: " + f.type);
//        console.info("$('#files').on > fileURL: " + fileURL);

        // Test whether the file URL is a pseudo URL
        if (isBlobURL(fileURL)) {
            // Build a absolute file URL
            fileURL = "file://localhost/" + param_local_templates_path;
            if (!fileURL.endsWith("/")) {
                fileURL += "/";
            }
            fileURL += f.name;
        }

        // Load the template
        loadTemplate(fileURL);
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
     * A general event handler for select elements, which are children of #template-html.
     * See: Table 8.1.3.5.1-1: Attributes of Selection Items
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
            replaceElmWithTemplateAsDiv(elm, srcFileName, "");
        }
    });


    /**
     * Loads a template file from a given URL.
     * 
     * @param url The URL of the template to load. If it is a realative URL it must
     *            be specified relative to the base directory of the windew, e.g
     *            EasyRad's index.html directory.
     */
    function loadTemplate(url) {
        var dcterms;

//        console.log("loadTemplate > url: " + url);

        // Remove all head elements which were included by the already loaded templates
        removeTemplateHeadElements();

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

            // Store the URL of the loaded template in a global variable
            baseTemplateURL = url;
            embeddingTemplaetURL = "";
            actualProcessedTemplateURL = url;

//            // Log the paths
//            console.log("loadTemplate > $('#template-html').load > baseDirURL: " + baseDirURL);
//            console.log("loadTemplate > $('#template-html').load > baseTemplateURL: " + baseTemplateURL);
//            console.log("loadTemplate > $('#template-html').load > embeddingTemplaetURL: " + embeddingTemplaetURL);
//            console.log("loadTemplate > $('#template-html').load > actualProcessedTemplate: " + actualProcessedTemplate);

//            console.log("loadTemplate > $('#template-html').load > url: " + url);
//            console.log("loadTemplate > $('#template-html').load > status: " + status);
//            console.log("loadTemplate > $('#template-html').load > response: " + response);

            if (status !== "success") {
                window.alert("Could not load template: " + url);
                return;
            }
            
            // Preserve the title of the template (will be removed in function modifyLoadedTemplate()
            var title = $('#template-html').find("title").text();

            // Modify the loaded template
            modifyLoadedTemplate($("#template-html"));

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
     * Modifies a loaded template:
     * - Adapt relative links of <img> and <link> elements.
     * - Replace <input type="textarea"> elements with <textarea> elements.
     * Relative URLs must be specified relative to index.html.
     * @param baseElm JQuery object containing the loaded template as child elements.
     */
    function modifyLoadedTemplate(baseElm) {

//        // Log the paths
//        console.log("modifyLoadedTemplate > baseDirURL: " + baseDirURL);
//        console.log("modifyLoadedTemplate > baseTemplateURL: " + baseTemplateURL);
//        console.log("modifyLoadedTemplate > embeddingTemplateURL: " + embeddingTemplateURL);
//        console.log("modifyLoadedTemplate > actualProcessedTemplateURL: " + actualProcessedTemplateURL);

        // Remove <title> element of loaded template (will be set in function loadTemplate) 
        $(baseElm).find("title").each(function (index) {
            $(this).remove();
        });

        // Move <meta name="..."> elements into head part of index.html (e.g. EasyRad's HTML page)
        // Remove all other meta elements
        $(baseElm).find("meta").each(function (index) {
            if ($(this).attr("name")) {
                // Move to head element
                $("head").append($(this));
            } else {
                $(this).remove();
            }
        });

        // Move <link> into head part of index.html (e.g. EasyRad HTML page) and correct the relative link
        $(baseElm).find("link").each(function (index) {
            // Move to head element
            $("head").append($(this));

            var hrefUrl = $(this).attr("href");
            var newHrefUrl = redirectUrl(hrefUrl);

            $(this).attr("href", newHrefUrl);
        });

        // For <img> elements: Change the path from relative to file to relative to index.html
        $(baseElm).find("img").each(function (index) {
            var srcUrl = $(this).attr("src");
            var newSrcUrl = redirectUrl(srcUrl);

//            console.log("modifyLoadedTemplate-img > srcUrl: " + srcUrl);
//            console.log("modifyLoadedTemplate-img > newSrcUrl: " + newSrcUrl);

            $(this).attr("src", newSrcUrl);
        });

        // Process <embed> elements
        $(baseElm).find("embed").each(function (index) {
            replaceEmbedElm($(this));
        });

//        // FOR BACKWARD COMPATIBILITY ONLY:
//        // Replace <input type="textarea" /> with a TEXTAREA tags
//        $(baseElm).find("input[type='textarea']").replaceWith(function () {
//            return $("<textarea/>", {// JQuery object-literal
//                name: this.name,
//                "data-field-type": $(this).attr("data-field-type"),
//                "data-field-merge-flag": $(this).attr("data-field-merge-flag"),
//                "data-field-verbal-trigger": $(this).attr("data-field-verbal-trigger"),
//                "data-field-completion-action": $(this).attr("data-field-completion-action"),
//                "Title": $(this).attr("Title"),
//                id: this.id,
//            }).val($(this).val());
//        });
    }


    /*
     * 
     * @param {type} url
     * @returns {unresolved}
     */
    function redirectUrl(url) {
        var newURL;

        if (baseDirURL.startsWith("http:")) {
            // EasyRad runs on a server
            if (isRelativeURL(url)) {
                // url to redirect is a relative URL
                newURL = removeFilename(actualProcessedTemplateURL) + url;
            } else {
                // url to redirect is an absolute URL
                newURL = url;
            }
        } else {
            if (baseDirURL.startsWith("file:")) {
                // EasyRad runs in the local filesystem
                if (isRelativeURL(url)) {
                    // url to redirect is a relative URL
                    if (embeddingTemplateURL.length === 0) {
                        // baseDirURL is always an absolute address
                        newURL = removeFilename(baseTemplateURL) + url;
                    } else {
                        // baseDirURL is always an absolute address
                        newURL = removeFilename(actualProcessedTemplateURL) + url;
                    }
                } else {
                    // url to redirect is an absolute URL
                    newURL = url;
                }
            } else {
                newURL = url;
                windows.alert("EasyRad runs neither on a server, nor in the local filesystem: " + baseDirURL);
            }
        }

        // Log the paths
        console.log("redirectUrl > url: " + url);
        console.log("redirectUrl > baseDirURL: " + baseDirURL);
        console.log("redirectUrl > baseTemplateURL: " + baseTemplateURL);
        console.log("redirectUrl > embeddingTemplateURL: " + embeddingTemplateURL);
        console.log("redirectUrl > actualProcessedTemplateURL: " + actualProcessedTemplateURL);
        console.log("redirectUrl > newURL: " + newURL);

        return newURL;
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
        replaceElmWithTemplateAsDiv(embedElm, srcFileName);
    }


    /**
     * Replaces an element with a <div> element containing the loaded 
     * template as its children.
     * 
     * @param elm The element to be replaced.
     * @param templateURL The URL of the template file to embed
     */
    function replaceElmWithTemplateAsDiv(elm, templateURL) {
        var divElm;
        var urlToLoad;


        // Create a new <div> element
        divElm = document.createElement("DIV");
        // Replace the <embed> element with the new <div>
        $(elm).replaceWith(divElm);

        urlToLoad = removeFilename(baseTemplateURL) + templateURL;

//        // Log the URLs
//        console.log("replaceElmWithTemplateAsDiv > templateURL: " + templateURL);
//        console.log("replaceElmWithTemplateAsDiv > baseTemplateURL: " + baseTemplateURL);
//        console.log("replaceElmWithTemplateAsDiv > embeddingTemplateURL: " + embeddingTemplateURL);
//        console.log("replaceElmWithTemplateAsDiv > actualProcessedTemplateURL: " + actualProcessedTemplateURL);
//        console.log("replaceElmWithTemplateAsDiv > urlToLoad: " + urlToLoad);

        // Load the content of the embedded template as children of the <div>
        // From the loaded HTML document the <html>, <head> and <body> elements 
        // were automatically removed.
        // The child elements of <head> and <body> are inserted in the sequence 
        // of appearing in the origibnal file
        $(divElm).load(urlToLoad, function (response, status, xhr) {
            // Function is executed after completition of load

            embeddingTemplateURL = actualProcessedTemplateURL;
            actualProcessedTemplateURL = urlToLoad;

            // Modify the loaded template
            modifyLoadedTemplate(divElm);
//            modifyLoadedTemplate(divElm, urlToLoad, removeFilename(templateURL));

        });
    }

});


/**
 * Tests, whether a given URL is a pseudo URL starting with "blob":.
 * blob:null and blob:http are pseudo URLs to reference objects read by FileReader.
 * 
 * @param {String} url The URL to test
 * @returns {Boolean} True, if the given URL is a pseudo URL.
 */
function isBlobURL(url) {

    // blob:null and blob:http pseudo URLs are absolute
    if (url.startsWith("blob:")) {
        return true;
    }
    return false;
}


/**
 * Tests, whether a given URL is relative.
 * 
 * @param {String} url The URL to test
 * @returns {Boolean} True, if the given URL is relative.
 */
function isRelativeURL(url) {

    // Pseudo URLs are absolute
    if (isBlobURL(url)) {
        return false;
    }

    try {
        // Throws exception for non-absolute URLs
        new URL(url);
        return false;
    } catch (err) {
        return true;
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
function removeFilename(url) {
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
 * @date 2018-06-08
 * 
 * @param {string} querystring URL parameter
 */
function getUrlParameter(querystring) {
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
            param_template = decodeURI(val);
        }
        if (key === "hide") {
            param_hide_selection = (val === '1' ? true : false);
        }
        if (key === "path") {
            param_local_templates_path = decodeURI(val);
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
 * Remove all head elements which were included by the already loaded templates 
 */
function removeTemplateHeadElements() {
    $("head").find("link").each(function (index) {
        if (originalLinks.indexOf($(this).attr("href")) < 0) {
            $(this).remove();
        }
    });

    $("head").find("meta").each(function (index) {
        if ($(this).attr("name")) {
            $(this).remove();
        }
    });
}

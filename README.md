﻿# EasyRad

**NEW:** Version 2.2.0


EasyRad is a browser application that allows you to fill out radiology report templates and to copy the result as HTML or plain text into the clipboard for further processing. The templates must comply with the IHE Radiology Technical Framework Supplement Management of Radiology Report Templates (MRRT).

**[HOMEPAGE](http://iftm.de/index.php/radiologie/easyrad)**



## Installation
Download the `easyrad` directory of this project to either a local directory or a server directory.

Start a web browser and enter the link to the downloaded directory followed by `/index.html`.
Sample: If you have downloaded the files to your local computer at `C:/tmp/easyrad/` enter the following link in browser: `file:///C:/tmp/easyrad/index.html`. When using the software on a server the `index.html` may be omitted.

THAT's ALL!



## Compatibility
In principle, EasyRad can be used with any browser. However, due to used libraries and security settings of individual browsers, certain restrictions apply. For example, some browsers cannot copy formatted HTML text to the clipboard. For security reasons, some browsers prohibit the integration of HTML code (in this case templates) into existing web pages if the code is located in a user selected file in the local file system.


|Browser | Version | Server based EasyRad | Local Filesystem based EasyRad | Local Filesystem based EasyRad |
|:---|:---:|:---:|:---:|:---:|
| | | | Template selection: Dropdown list | Template selection: File selection dialog |
|Firefox | 41+ | + | + | + |
|Edge | all | + | + | + |
|Safari | 10+ | + | + (local file restrictions must be disabled in the developer menu) | + (local file restrictions must be disabled in the developer menu) |
|Chrome | 42+ | + | - | - |
|Internet Explorer | 9+ | + (text export only) | - | - |

As an alternative to the browser installed on your computer, you can use a portable version of Firefox on Windows systems. It can download from the following link: [PortableApps.com : Firefox](https://portableapps.com/de/apps/internet/firefox_portable). The portable version does not need to be installed, so you do not need administrator rights on your computer to use EasyRad.


## Usage
The applications presents a simple user interface divided into three sections:

[The user interface without a template](easyrad/img/docs/ui-no-template.png)


The top sections contains several buttons to control the application. The middle section presents the template file rendered as HTML. The bottom sections contains the copyright notice and license information.


#### `Favored templates`
This drop-down menu allows to load one of predefined templates by selecting its name. The list of templates is configurable (see: Configuration >> List of favored templates).

[The user interface with loaded template](easyrad/img/docs/ui-template.png)


#### `Select template`
When pressing the button a standard file dialog is presented, which allows to select a local template file. After selecting an appropriate file its name is displayed left to the button and its content is rendered in the middle section of the user interface.

**Please Note:**
This option is only available if EasyRad has been started on a server.

[The user interface with loaded template](easyrad/img/docs/ui-template.png)


#### ` ? `

When pressing this button optional information about the actual loaded template is displayed in a modal dialog box.

[Information about the actual template](easyrad/img/docs/ui-info.png)


#### `Copy`

When pressing this button the completed form is copied to the system clipboard as plain and/or HTML formatted text .

Use the clipboard content to transfer the text to your RIS or HIS system or to put it into a word processor.

[Final text copied to the clipboard](easyrad/img/docs/copy-clipboard.png)



## Configuration

### Start-up behavior
Some aspects of EasyRad may be configured during start-up. When loading the `index.html` page, the following URL-parameter are evaluated and stored in global JavaScript variables:

|URL-parameter | JavaScript variable | Description |
|---|---|---|
|tpl| param_template | A valid URL of a template file relative to `index.html`, that should be loaded when the applications starts. |
|path| param_rel_path_to_local_templates | Relative Path from EasyRad's base directory to the directory where local template files (including referenced files) reside. MUST be a child directory of EasyRad's base directory. This global value may be overwritten by parameter 'path' when starting EasyRad. |
|hide| param_hide_selection |If set to `1`, the user interface elements to select favored templates and to load templates from the filesystem are hidden. |

**Please Note:**
URLs can only be sent over the Internet using the ASCII character-set. Since URLs often contain characters outside the ASCII set, the URL has to be converted into a valid ASCII format. URL encoding replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits. URLs cannot contain spaces. URL encoding replaces a space with %20.

Sample: The URL

```
http://localhost:8383/ReportCreator/index.html?tpl=templates/mrt_rectalca.html&hide=1
```
starts EasyRad with the template `mrt_rectalca.html` preloaded and hidden user interface elements to select other templates.


### Configuration of text rendering
Some aspects of rendering the text are configurable by parameters specified in file `config/config.js`.


|Parameter | Default value | Description |
|---|---|---|
| CLIPBOARD_TYPE | "BOTH" | The type of content of the clipboard when exporting the report: HTML = text/html only, HTML = text/plain only, BOTH = text/html and text/plain. |
| OPTIONS_DELIMITER | ", " | Delimiter between to options in one select element. |
| HTML_FORM_PRAEFIX   | "" | The string to be used as praefix when converting form elements to text inside <span> elements. |
| HTML_FORM_POSTFIX | " " | The string to be used as postfix when converting form elements to text inside <span> elements. |
| IGNORE_HIDDEN_ELEMENTS | true | If true, elements and their children are ignored in the output if the 'hidden' attribute is set. |
| IGNORE_LABELS_OF_EMPTY_ELEMENTS | true | If true,  labels of empty form elements (empty text value) are ignored in the output. |
| IGNORE_EMPTY_SECTION_ELEMENTS | true | If true, empty section elements are ignored in the output. A section element is empty, if its children (except the header elment) do not contain any text. |


### List of favored templates
The user interface provides a drop-down menu for selecting favored templates. The selectable list of template files is user-configurable: The file  `easyrad/config/favored-templates.js` defines the array `favoredTemplates` which describes the menu as name - URL - pairs. To modify the list follow the instructions given in the file. After saving the file and reloading `easyrad/index.html` the new menu is available.


### Style adaption
The style of the application can be overloaded by adding appropriate CSS rules to the file `easyrad/config/user.css`. If necessary scripts could be added also in the file  `easyrad/config/user.js`.

Please note that these files are loaded after the applications files and override the default style. But, when loading a template, its optional style and script files may override the user files again.


### Translation of user interface

The texts of the user interface are displayed in the preferred language selected in the browser. If the language is not available in the translations of the application English is used as the fall-back language.

By editing the file `lang/translations.js` additional languages could be easyly provided: For a new language the block `en: {}` should be copied and labeled with the ISO 639-1 two-letter code of the new language instead of `en`. After that the english texts must be replaced with their translations. After saving the file and reloading `easyrad/index.html` the new language is available.


## Implementation details

### Implemented standard
EasyRad renders report templates which fulfill the technical specification given in Volume 3 "Content Modules" of the MRRT standard in the version of July 14, 2017. The text could be downloaded here: [http://ihe.net/Technical_Frameworks/]( http://ihe.net/Technical_Frameworks/) 

#### Additional features
The MRRT standard specifies that tags that are not listed in the standard should be ignored.

EasyRad allows the `<mark>` tag, which is not specified in MRRT, within templates. The tag itself and its child tags are displayed while editing the template, but the content is not exported to the clipboard.

#### Limitations
No limitation to the standard.

### Rendering of templates
When pressing the `COPY` button, the completed form is rendered in a two stage process: 

In a first step, the completed template is converted by `function convertToHtml()` in file `converter-html.js` into a reduced HTML format that no longer contains any form tags (`<input>`, `<select>`, `<option>` and `<textarea>`).

This reduced HTML code may be exported to the clipboard.

The following rules are applied for the conversion:

- `<input>`, `<textarea>` and `<select>` tags are replaced by a `<span>` tag
- The attributes of the form tag are copied to the `<span>` tag
- The text of the `<span>` tag is set to the value of the form element as specified in MRRT. The text is praefixed and postfixed with the fixed strings specified in the global parameters `HTML_FORM_PRAEFIX` and `HTML_FORM_POSTFIX`
- If the template specifies a label for the form tag, the text of the `<label>` tag is inserted as an additional `<span>` tag
- If the form element, which is referenced by the label, does not contain any text and the global parameter `IGNORE_LABELS_OF_EMPTY_ELEMENTS` is set to `true`, the label is ignored
- If a template section does not contain any text and the global parameter `IGNORE_EMPTY_SECTION_ELEMENTS` is set to `true`, the section is ignored
- The `<head>` tag and its children are removed
- References in `<img>` and `<link>` tags are replaced with absolute URLs
- `<mark>` tags and the children are removed
- Tags with an attribute `disabled` are removed


In a second step the reduced HTML content is rendered by `function convertToText()` in file `converter-text.js` to plain text. 

This resulting text may be exported to the clipboard.

For that the following rules apply:



|Element | Prefix | Content | Postfix |Evaluate children |
|---|---|---|---| --- |
|     |     |     |     |     |
| **Text:** |     |     |     |     |
| Text between elements | --- | text (white spaces at the beginning and end are removed) | space |     |
|     |     |     |     |     |
| **Sections:** |     |     |     |     |
| SECTION | newline + newline | --- | --- | X |
| HEADER | --- | --- | newline + newline | X |
|     |     |     |     |     |
| **Grouping content:** |     |     |     |     |
| SPAN | --- | --- | space | X |
| DIV | --- | --- | newline + newline | X |
| P | --- | --- | newline + newline | X |
| LI | If the parent element is "UL": "-" + space. If the parent element is "OL": "x" + space | --- | newline | X |
| OL | newline | --- | --- | X |
| UL | newline | --- | --- | X |
|     |     |     |     |     |
| **Tables:** |     |     |     |     |
| TABLE | newline + newline | --- | newline + newline | X |
| TD | --- | --- | --- | X |
| TH | --- | --- | --- | X |
| TR | --- | --- | newline | X |
|     |     |     |     |     |
| **Text-level semantics:** |     |     |     |   |
| A | --- | "[" + elm.href + "]"  | space | X |
| BR | --- | --- | newline | X |
| EM | --- | --- | --- | X |
| Q | quote | --- | quote | X |
| SPAN | --- | --- | --- | X |
| STRONG | --- | --- | --- | X |
| SUB | --- | --- | --- | X |
| SUP | --- | --- | --- | X |
| U | --- | --- | --- | X |
|     |     |     |     |     |
| **Embedded content:** |     |     |     |     |
| IMG | --- | "[" + elm.src + ", " + elm.alt + "]"  | space | X |

If the rendering results in
- two or more consecutive empty lines, they are replaced by one empty line before putting into the clipboard.
- in two or more consecutive spaces, they are replaced by one space before putting into the clipboard.
- contains a space directly followed by a period, the space is removed before putting into the clipboard.


### Used libraries
The following libraries are used by EasyRad:

|Library | Version | License | URL |
|---|---|---|---|
|jQuery|3.2.1|MIT|[http://jquery.com/download/](http://jquery.com/download/)|
|Bootstrap|3.3.7|MIT|[http://getbootstrap.com/getting-started/](http://getbootstrap.com/getting-started/)|
|Bootstrap Filestyle|1.2.1|MIT|[https://github.com/markusslima/bootstrap-filestyle](https://github.com/markusslima/bootstrap-filestyle)|
|clipboard-polyfill|2.4.6|MIT|[https://github.com/lgarron/clipboard-polyfill](https://github.com/lgarron/clipboard-polyfill)|
|String.prototype.startsWith|0.2.0|MIT|[https://github.com/mathiasbynens/String.prototype.startsWith](https://github.com/mathiasbynens/String.prototype.startsWith)|


## Create/Edit templates

A good starting point for creation or editing of templates is the online version of the report template editor [T-Rex](http://report.karoshealth.com:8888/trex/).



## Tests

No tests are implemented yet.

In the `samples` directory a test template `IHE_MRRT_Example_TI_TH.html` is available, which is based on the original IHE sample template. It is extended by tags allowed by the standard, but not included in the IHE sample file.
In addition the `<textarea>` tag is include in the file although this tag is not allowed by the MRRT standard 



## Contributors

Contributions welcome!



## License

EasyRad can be used according to the GNU Affero General Public License (AGPL) 3.0. The GNU Affero General Public License is a modified version of the ordinary GNU GPL version 3. It has one added requirement: if you run a modified program on a server and let other users communicate with it there, your server must also allow them to download the source code corresponding to the modified version running there.

© IFTM Institut für Telematik in der Medizin GmbH





# EasyRad Editor
EasyRad Editor is a browser application that allows you to edit radiology report templates and to copy the result as plain text into the clipboard for further processing. The templates must comply with the IHE Radiology Technical Framework Supplement Management of Radiology Report Templates (MRRT).

**This version is an experimental proof of concept and not intended for daily use.**

## Installation
Download the `easyrad` directory of this project to either a local directory or a server directory.

Start a web browser and enter the link to the downloaded directory followed by `/edit/index.html`.
Sample: If you have downloaded the files to your local computer at `C:/tmp/easyrad/` enter the following link in browser: `file:///C:/tmp/easyrad/edit/index.html`. When using the software on a server the `index.html` may be omitted.

THAT's ALL!


## Usage
The applications presents a simple user interface divided into three sections:
The top sections contains several buttons to control the application. The middle section presents the template file rendered as HTML. The bottom sections contains the copyright notice and license information.


## Configuration

### Start-up behavior
If the global JavaScript variable `easyrad_param_template_to_edit` is set to a valid URL of a template file, that file is loaded into the editor when the applications starts.


### Style adaption
The style of the application can be overloaded by adding appropriate CSS rules to the file `easyrad/config/user.css`. If necessary scripts could be added also in the file  `easyrad/config/user.js`.

Please note that these files are loaded after the applications files and override the default style. But, when loading a template, its optional style and script files may override the user files again.


### Translation of user interface

The texts of the user interface are displayed in the preferred language selected in the browser. If the language is not available in the translations of the application English is used as the fall-back language.

By editing the file `edit/lang/translations.js` additional languages could be easily provided: For a new language the block `en: {}` should be copied and labeled with the ISO 639-1 two-letter code of the new language instead of `en`. After that the English texts must be replaced with their translations. After saving the file and reloading `easyrad/edit/index.html` the new language is available.




## Implementation details
EasyRadEditor is based on the TinyMCE editor, which is highly configurable and allows to add additional features by plugins.



### Template modification during editing
The MRRT standard defines a multiline text field as `<input type="textarea">` whereas HTML5 specifies it as `<textarea>`. The `type="textarea"` is not defined in HTML5.
To allow editing the template with the HTML editor TinyMCE, all `<input type="textarea">` elements are converted on the fly to `<textarea>` elements when the template is loaded into the editor and vice versa when saving it.
During this rocedure the attributes of the `<input type="textarea">` are copied to the `<textarea>` elements (besides the `type` attribute, which does not make sense in a `<textarea>`.



### Used libraries
Besides the libraries used EasyRad the following libraries are used by EasyRad Editor:

|Library | Version | License | URL |
|---|---|---|---|
| TinyMCE |4.5.7|LGPL 2.0|[http://jquery.com/download/](https://www.tinymce.com/download//)|



## Tests

No tests are implemented yet.


## Contributors

Contributions welcome!



## License

EasyRad Editor can be used according to the GNU Affero General Public License (AGPL) 3.0. The GNU Affero General Public License is a modified version of the ordinary GNU GPL version 3. It has one added requirement: if you run a modified program on a server and let other users communicate with it there, your server must also allow them to download the source code corresponding to the modified version running there.

© IFTM Institut für Telematik in der Medizin GmbH

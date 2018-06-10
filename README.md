# EasyRad
EasyRad is a browser application that allows you to fill out radiology report templates and to copy the result as HTML or plain text into the clipboard for further processing. The templates must comply with the IHE Radiology Technical Framework Supplement Management of Radiology Report Templates (MRRT).

**[HOMEPAGE](http://iftm.de/index.php/radiologie/easyrad)**



## Installation
Download the `easyrad` directory of this project to either a local directory or a server directory.

Start a web browser and enter the link to the downloaded directory followed by `/index.html`.
Sample: If you have downloaded the files to your local computer at `C:/tmp/easyrad/` enter the following link in browser: `file:///C:/tmp/easyrad/index.html`. When using the software on a server the `index.html` may be omitted.

THAT's ALL!



## Compatibility
EasyRad can be called either on a server or in the local file system. Templates that are to be edited are integrated into the main page of EasyRad. This procedure is the easiest way for the user to use the program, but for security reasons it also has some limitations. These ultimately lead to incompatibilities with some browsers.

|Browser | Version | Server based EasyRad | Local Filesystem based EasyRad | Local Filesystem based EasyRad |
|:---|:---:|:---:|:---:|:---:|
| | | Server based template | Server based template | Local Filesystem based template |
|Firefox | 41+ | + | + | + |
|Chrome | 42+ | + | + | + |
|Edge |  | + | + | + |
|Safari | 10+ | + | + | + |
|Internet Explorer | 9+ | + (text only) | + (text only) | + (text only) |
|iOS Safari | 10+ | + (text only) | + (text only) | + (text only) |
|Opera | 29+ | + | + | + |

Full compatibility can be achieved with Firefox. If you do not have Firefox installed on your computer, you can download a portal version of the browser from the following link: [PortableApps.com : Firefox](https://portableapps.com/de/apps/internet/firefox_portable).

The portable version does not need to be installed, so you do not need administrator rights on your computer to use EasyRad.


## Usage
The applications presents a simple user interface divided into three sections:

[The user interface without a template](easyrad/img/docs/ui-no-template.png)


The top sections contains several buttons to control the application. The middle section presents the template file rendered as HTML. The bottom sections contains the copyright notice and license information.


#### `Favored templates`
This drop-down menu allows to load one of predefined templates by selecting its name. The list of templates is configurable (see: Configuration >> List of favored templates).

[The user interface with loaded template](easyrad/img/docs/ui-template.png)


#### `Select template`
When pressing the button a standard file dialog is presented, which allows to select a local template file. After selecting an appropriate file its name is displayed left to the button and its content is rendered in the middle section of the user interface.

[The user interface with loaded template](easyrad/img/docs/ui-template.png)


#### ` ? `

When pressing this button optional information about the actual loaded template is displayed in a modal dialog box.

[Information about the actual template](easyrad/img/docs/ui-info.png)


#### `Copy`

When pressing this button the HTML content including is rendered to plain text and copied to the system clipboard. The modifications of the input elements done by the user are respected.

Use the clipboard content to transfer the text to your RIS or HIS system or to put it into a word processor.

[Final text copied to the clipboard](easyrad/img/docs/copy-clipboard.png)



## Configuration

### Start-up behavior
Some aspects of EasyRad may be configured during start-up. When loading the `index.html` page, the following URL-parameter are evaluated and stored in global JavaScript variables:

|URL-parameter | JavaScript variable | Description |
|---|---|---|
|tpl| param_template | A valid URL of a template file relative to `index.html`, that should be loaded when the applications starts. |
|path| param_local_templates_path | Absolute URL of the directory where local template files (including referenced files) reside. The base directory of EasyRad, ie. the directory where index.html resides, MUST be in the path of the specified directory. |
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
| OPTIONS_DELIMITER | ", " | Delimiter between to options in one select element. |
| LABEL_SUFFIX   | ":" | The suffix to append to a label if not already present. May be an empty string. |
| USE_OPTION_TEXT | true | If true, the text node of an OPTION element is used as its value. Otherwise the value attribute is used (as MRRT specifies) |
| MESSAGE_DESTINATION | "CONSOLE" | Specifies the destination for messages (error, warnings). Possible value: "CONSOLE", "REPORT", "NO" |
| EMBED_DIRECTORY_URL | "" | Specifies the URL of the directory where templates to embed are located. May be either a absolute or relative URL. If relative, it must be specified relative to the embedding template. If empty, the URL of the embedding template is used. |


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
EasyRad renders report templates which fulfill the technical specification given in Volume 3 "Content Modules" of the MRRT standard in the version of September 9, 2016. The text could be downloaded here: [http://ihe.net/Technical_Frameworks/]( http://ihe.net/Technical_Frameworks/) 

#### Additional features
The application renders the `<textarea>` tag although it is not allowed by MRRT.
`<label>` tags may be applied to all tags although MRRT restricts them to template fields, i.e. `<select>` and `<input>` tags.

#### Limitations
The actual version does not support referenced content inside template.
This limitation causes, that 
1.	referenced images are not displayed in the user interface,
2.	the `<embed>` tag is ignored.

Templates may import stylesheets with the `<link>` tag, but the URL must be specified relative to the `easyrad/index.html` file.

Due to limitations of the used clipboard.js library the following browsers are supported:
- Chrome 42+
- Firefox 41+
- Safari 10+
- Edge 12+
- IE 9+
- Opera 29+

### Rendering of templates
The MRRT templates are first rendered as HTML5 content. Because HTML5 does not support the `<INPUT type="textarea">` element defined in MRRT, this element is replaced by a `<textarea>` element.
When pressing the `COPY` button, the HTML5 content is rendered as pure text. For that the following rules apply:

|Element | Prefix | Content | Postfix |Evaluate children |
|---|---|---|---| --- |
|     |     |     |     |     |
| **Special cases:** |     |     |     |     |
| Text between elements | --- | text (white spaces at the beginning and end are removed) | space |     |
|     |     |     |     |     |
| LABEL The following is inserted as a prefix of the referenced element. If the value of the referenced element is empty or a "INPUT/checkbox" is not checked, nothing is inserted. | --- | label.text | LABEL_SUFFIX + space |     |
|     |     |     |     |     |
| Elements with attribute "disabled" or "hidden" set are ignored |     |     |     |     |
| Elements with a CSS property "display: none" or "visibility: hidden" are ignored |     |     |     |     |
|     |     |     |     |     |
| **The root element:** |     |     |     |     |
| HTML | --- | --- | --- |     |
|     |     |     |     |     |
| **Document metadata:** |     |     |     |     |
| HEAD | --- | --- | --- |     |
| META | --- |     | --- |     |
| STYLE | --- | --- | --- |     |
| TITLE | --- |     | --- |  X  |
| LINK | --- | --- | --- |     |
|     |     |     |     |     |
| **Scripting:** |     |     |     |     |
| SCRIPT | --- | --- | --- |     |
|     |     |     |     |     |
| **Embedded content:** |     |     |     |     |
| EMBED | --- | --- | --- |  X  |
| IMG | --- | "[" + elm.src + ", " + elm.alt + "]"  | space | X |
|     |     |     |     |     |
| **Sections:** |     |     |     |     |
| BODY | --- | --- | --- | X |
| SECTION | newline + newline | --- | --- | X |
| HEADER | --- | --- | newline + newline | X |
|     |     |     |     |     |
| **Grouping content:** |     |     |     |     |
| LI | If the parent element is "UL": "-" + space. If the parent element is "OL": "x" + space | --- | newline | X |
| OL | newline | --- | --- | X |
| P | --- | --- | newline + newline | X |
| UL | newline | --- | --- | X |
|     |     |     |     |     |
| **Tables:** |     |     |     |     |
| TABLE | newline + newline | --- | newline + newline | X |
| TD | --- | --- | --- | X |
| TH | --- | --- | --- | X |
| TR | --- | --- | newline | X |
|     |     |     |     |     |
| **Forms:** |     |     |     |     |
| INPUT type = text, number, date, time | --- | elm.value | space | X |
| INPUT type = checkbox | --- | If the element is "checked": elm.value | If the element is "checked": space | X |
| INPUT type = textarea | (---) | (elm.value) | (space) | X |
| TEXTAREA | --- | elm.value | newline |   |
| OPTION | --- | --- | --- |   |
| SELECT | --- | The value of the selected option(s) | space | X |
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

If the rendering results in two or more consecutive empty lines, they are replaced by one empty line before putting into the clipboard.

If the rendering results in two or more consecutive spaces, they are replaced by one space before putting into the clipboard.

If the rendering results contains a space directly followed by a period, the space is removed before putting into the clipboard.



### Used libraries
The following libraries are used by EasyRad:

|Library | Version | License | URL |
|---|---|---|---|
|jQuery|3.2.1|MIT|[http://jquery.com/download/](http://jquery.com/download/)|
|Bootstrap|3.3.7|MIT|[http://getbootstrap.com/getting-started/](http://getbootstrap.com/getting-started/)|
|Bootstrap Filestyle|1.2.1|MIT|[https://github.com/markusslima/bootstrap-filestyle](https://github.com/markusslima/bootstrap-filestyle)|
|clipboard.js|1.6.1|MIT|[https://github.com/zenorocha/clipboard.js/](https://github.com/zenorocha/clipboard.js/)|


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

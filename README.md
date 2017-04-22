# EasyRad
EasyRad is a browser application that allows you to fill out radiology report templates and to copy the result as plain text into the clipboard for further processing. The templates must comply with the IHE Radiology Technical Framework Supplement Management of Radiology Report Templates (MRRT).

**[HOMEPAGE](http://iftm.de/index.php/radiologie/easyrad)**



## Installation
Download the `easyrad` directory of this project to either a local directory or a server directory.

Start a web browser and enter the link to the downloaded directory followed by `/index.html`.
Sample: If you have downloaded the files to your local computer at `C:/tmp/easyrad/` enter the following link in browser: `file:///C:/tmp/easyrad/index.html`. When using the software on a server the `index.html` may be ommitted.

THAT's ALL!



## Configuration

### List of favored templates

### Style adaption
The style of the application can be overloaded by adding appropriate CSS rules to the file `easyrad/config/user.css`. If neccessary scripts could be added also in the file  `easyrad/config/user.js`.

Please note that these files are loaded after the applications files and override the defaut style. But, when loading a template, its optional style and script files may override the user files again.



### Translation of user interface

The texts of the user interface are displayed in the preferred language selected in the browser. If the language is not available in the translations of the application English is used as the fall-back language.

By editing the file `lang/translations.js` additional languages could be easyly provided: For a new language the block `en: {}` should be copied and labeled with the ISO 639-1 two-letter code of the new language instead of `en`. After that the english texts must be replaced with their translations. After saving the file and reloading of the `easyrad/index.html` file the new language is available.


## Usage

[The user interface](easyrad/img/docs/ui-no-template.png)

[The user interface with loaded template](easyrad/img/docs/ui-template.png)

[Information about the actual template](easyrad/img/docs/ui-template.png)

[The user interface with loaded template](easyrad/img/docs/ui-info.png)

[Final text copied to the clipboard](easyrad/img/docs/copy-clipboard.png)



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
2.	The `<embed>` tag is ignored.

Due to limitations of the used clipboard.js library the following browsers are supported:
- Chrome 42+
- Firefox 41+
- Safari 10+
- Edge 12+
- IE 9+
- Opera 29+

### Rendering of templates
The MRRT templates are first rendered as HTML5 content. Because HTML5 does not support the `<INPUT type="textarea">` element defined in MRRT, this element is replaced by a `<textarea>` element.
When pressing the `COPY` button, the HTML5 content is rendered as pure text. For that the following rules applay:

|Element | Praefix | Content | Postfix |
|---|---|---|---|
|     |     |     |     |
| **Special cases:** |     |     |     |
| Text between elements | --- | text (white spaces at the beginning and end are removed) | space |
|     |     |     |     |
| LABEL | if label text is defined for an element, the following is inserted for the referenced element: label text + ":". If the referenced element is a "INPUT/checkbox" and the element is not checked, nothing is inserted. | --- | --- | --- |
|     |     |     |     |
| Elements with attribute "disabled" or "hidden" set are ignored |     |     |     |
| Elements with a CSS property "display: none" or "visibility: hidden" are ignored |     |     |     |
|     |     |     |     |
| **The root element:** |     |     |     |
| HTML | --- | --- | --- |
|     |     |     |     |
| **Document metadata:** |     |     |     |
| HEAD | --- | --- | --- |
| META | --- |     | --- |
| STYLE | --- | --- | --- |
| TITLE | --- |     | --- |
| LINK | --- | --- | --- |
|     |     |     |     |
| **Scripting:** |     |     |     |
| SCRIPT | --- | --- | --- |
|     |     |     |     |
| **Embedded content:** |     |     |     |
| EMBED | --- | --- | --- |
| IMG | --- | --- | "[" + elm.src + ", " + elm.alt + "]" + space |
|     |     |     |     |
| **Sections:** |     |     |     |
| BODY | --- | --- | --- |
| SECTION | newline newline | --- | --- |
| HEADER | --- | --- | newline newline |
|     |     |     |     |
| **Grouping content:** |     |     |     |
| LI | If the parent element is "UL": "-" + space. If the parent element is "OL": "x" + space | --- | newline |
| OL | newline | --- | --- |
| P | --- | --- | newline newline |
| UL | newline | --- | --- |
|     |     |     |     |
| **Tables:** |     |     |     |
| TABLE | newline newline | --- | newline newline |
| TD | --- | --- | --- |
| TH | --- | --- | --- |
| TR | --- | --- | newline |
|     |     |     |     |
| **Forms:** |     |     |     |
| INPUT type = text, number, date, time | --- | elm.value | space |
| INPUT type = checkbox | --- | If the element is "checked": elm.value | If the element is "checked": space |
| INPUT type = textarea | (---) | (elm.value) | (space) |
| TEXTAREA | --- | elm.value | newline |
| OPTION | --- | --- | --- |
| SELECT | --- | --- | --- |
|     |     |     |     |
| **Text-level semantics:** |     |     |     |
| A | --- | --- | "[" + elm.href + "]" + space |
| BR | --- | --- | newline |
| EM | --- | --- | --- |
| Q | quote | --- | quote |
| SPAN | --- | --- | --- |
| STRONG | --- | --- | --- |
| SUB | --- | --- | --- |
| SUP | --- | --- | --- |
| U | --- | --- | --- |

If the rendering results in two or more consecutive empty lines, they are replaced by one empty line before putting into the clipboard.



## Tests

No tests are implemented yet.

In the `samples` directory a test template `IHE_MRRT_Example_TI_TH.html` is available, which is based on the original IHE sample template. It is extended by tags allowed by the standard, but not included in the IHE sample file.
In addition the `<textarea>` tag is include in the file although this tag is not allowed by the MRRT standard 



## Contributors

Contributions welcome!



## License

EasyRad can be used according to the GNU Affero General Public License (AGPL) 3.0. The GNU Affero General Public License is a modified version of the ordinary GNU GPL version 3. It has one added requirement: if you run a modified program on a server and let other users communicate with it there, your server must also allow them to download the source code corresponding to the modified version running there.

© IFTM Institut für Telematik in der Medizin GmbH


# EasyRad
EasyRad is a browser application that allows you to fill out radiology report templates and to copy the result into the clipboard for further processing. The templates must comply with the IHE Radiology Technical Framework Supplement Management of Radiology Report Templates (MRRT).

**[HOMEPAGE](http://iftm.de/index.php/radiologie/easyrad)**


## Implemented standard
EasyRad implements the technical specification given in Volume 3 “Content Modules” of the standard in the version of September 9, 2016. The text could be downloaded here: [http://ihe.net/Technical_Frameworks/]( http://ihe.net/Technical_Frameworks/) 

### Limitations

Due to limitations of used libraries (clipboard.js) the following browsers are supported:
- Chrome 42+
- Firefox 41+
- Safari 10+
- Edge 12+
- IE 9+
- Opera 29+

### Additional features

## Synopsis

At the top of the file there should be a short introduction and/ or overview that explains **what** the project is. This description should match descriptions added for package managers (Gemspec, package.json, etc.)

## Code Example

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
| HEAD | --- |     | --- |
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
| IMG | --- | --- | "[" + elm.src + ", " + elm.alt + "] " |
|     |     |     |     |
| **Sections:** |     |     |     |
| BODY | --- | --- | --- |
| SECTION | "\n\n" | --- | --- |
| HEADER | --- | --- | "\n\n" |
|     |     |     |     |
| **Grouping content:** |     |     |     |
| LI | If the parent element is "UL": "- ". If the parent element is "OL": "x " | --- | "\n" |
| OL | "\n" | --- | --- |
| P | --- | --- | "\n\n" |
| UL | "\n" | --- | --- |
|     |     |     |     |
| **Tables:** |     |     |     |
| TABLE | "\n\n" | --- | "\n\n" |
| TD | --- | --- | --- |
| TH | --- | --- | --- |
| TR | --- | --- | "\n" |
|     |     |     |     |
| **Forms:** |     |     |     |
| INPUT type = text, number, date, time | --- | elm.value | space |
| INPUT type = checkbox | --- | If the element is "checked": elm.value | If the element is "checked": space |
| INPUT type = textarea | (---) | (elm.value) | (space) |
| TEXTAREA | --- | elm.value | "\n" |
| OPTION | --- | --- | --- |
| SELECT | --- | --- | --- |
|     |     |     |     |
| **Text-level semantics:** |     |     |     |
| A | --- | --- | "[" + elm.href + "] " |
| BR | --- | --- | "\n" |
| EM | --- | --- | --- |
| Q | quote character | --- | quote character |
| SPAN | --- | --- | --- |
| STRONG | --- | --- | --- |
| SUB | --- | --- | --- |
| SUP | --- | --- | --- |
| U | --- | --- | --- |


Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

Provide code examples and explanations of how to get the project.

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests

No tests are implemented yet.
In the `samples` directory a test template `IHE_MRRT_Example_TI_TH.html ` is available, which is based on the original IHE sample template. It is extended by tags allowed by the standard, but not included in the IHE sample file.
In addition the `<textarea>` tag is include in the file although this tag is not allowed by the MRRT standard 

## Contributors

Contributions welcome!

## License

EasyRad can be used according to the GNU Affero General Public License (AGPL) 3.0. The GNU Affero General Public License is a modified version of the ordinary GNU GPL version 3. It has one added requirement: if you run a modified program on a server and let other users communicate with it there, your server must also allow them to download the source code corresponding to the modified version running there.

© IFTM Institut für Telematik in der Medizin GmbH


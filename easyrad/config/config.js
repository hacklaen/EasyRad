/* 
 * Configuration parameter.
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
 * @author T. Hacklaender
 * @date 2018-06-07
 */


// Relative Path from EasyRad's base directory to the directory where local template files (including referenced files) reside.
// MUST be a child directory of EasyRad's base directory. 
// This global value may be overwritten by parameter 'path' when starting EasyRad.
REL_PATH_TO_LOCAL_TEMPLATES = "templates/local-sample-templates/";


// index.js: The type of content of the clipboard when exporting the report:
// HTML : text/html only
// HTML : text/plain only
// BOTH : text/html and text/plain
CLIPBOARD_TYPE = "BOTH";


// converter-html.js: Delimiter between to options in one select element
OPTIONS_DELIMITER = ", ";

// converter-html.js: The string to be used as praefix when converting form elements to text inside <span> elements 
HTML_FORM_PRAEFIX = "";

// converter-html.js: The string to be used as postfix when converting form elements to text inside <span> elements 
HTML_FORM_POSTFIX = " ";

// converter-html.js: If true,  labels of empty form elements (empty text value) 
// are ignored in the output.
IGNORE_LABELS_OF_EMPTY_ELEMENTS = true;

// converter-html.js: If true, empty section elements are ignored in the output.
// A section element is empty, if its children (except the header elment) do not 
// contain any text.
IGNORE_EMPTY_SECTION_ELEMENTS = true;

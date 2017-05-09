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
 * @date 2017-05-09
 */

// For Text in Clipboard: Delimiter between to options in one select element
OPTIONS_DELIMITER = ", ";

// For Text in Clipboard: The suffix to append to a label if not already present. May be an empty string.
LABEL_SUFFIX = ":";

// Specifies the destination for messages (error, warnings):
// 'CONSOLE': The message is displayed on the JavaScript console in the browser.
// 'REPORT': The message is inserted in the report text.
// 'NO', false, empty or not specified: The message is not displayed
MESSAGE_DESTINATION = "CONSOLE";

// DEPRECATED - May be removed in following versions with default value false.
// The following paramater is included temorary to visualize templates, which do not follow MRRT strict 
// For Text in Clipboard: If true, the text node of an OPTION element is used as its value.
//                        MRRT specifies, that its value attribute has ti be used, but that attribute value and text must be the same.
USE_OPTION_TEXT = true;

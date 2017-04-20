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
 * @version 1.0
 * @author T. Hacklaender
 * @date 2017-04-20
 */

/*
 * var userLang = navigator.language || navigator.userLanguage; 
 * alert ("The language is: " + userLang);
 * 
 * Usage: text = translations[lang].color;
 * where lang = 'en-US' etc
 * Link: http://stackoverflow.com/questions/8923644/localizing-strings-in-javascript
 */
var translations = {
    en-US: {
        color:'color',
        cell:'cell phone'
    },
    en-GB: {
        color: 'colour',
        cell: 'mobile phone'
    }
};

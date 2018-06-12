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
 * Usage:
 * The translation texts are organized as a key-value pair. To use a localized
 * text use the function i18n('key') to include the text as a string, 
 * e.g. i18n('favored_templates_btn')
 * 
 * @version 1.0
 * @author T. Hacklaender
 * @date 2018-06-11
 */

var translations = {
    
    // For language selection use ISO 639-1 two-letter code
    
    en: {
        favored_templates_btn: 'Favored Templates <span class="caret">',
        files_button_text: 'Select Template',
        get_info_btn: '?',
        to_clipboard_btn: 'Copy',
        template_title: 'Template title: ',
        template_publisher: 'Publisher: ',
        modal_title_text: 'Template Info',
        
        err_unknown_node_type: 'ERROR: Unknown node type = ',
        err_element_not_specified: 'ERROR: Element not specified in MRRT -> ignored: ',
        err_form_not_specified: 'ERROR: Form element is not specified in MRRT: ',
        err_element_ignored: 'ERROR: Element ignored by MRRT: ',
        err_text_has_no_parent: 'ERROR: Text node has no parent element: ',
        err_selected_file_not_html: 'ERROR: Selected file is not a HTML file: ',
        err_could_not_load_template: 'ERROR: Could not load template: ',
        err_unsupportet_scheme: 'ERROR: Unsupportet scheme for starting EasyRad: ',
    },
    
    de: {
        favored_templates_btn: 'Bevorzugte Vorlagen <span class="caret">',
        files_button_text: 'Vorlage auswählen',
        get_info_btn: '?',
        to_clipboard_btn: 'Kopieren',
        template_title: 'Titel der Befundvorlage: ',
        template_publisher: 'Herausgeber: ',
        modal_title_text: 'Infos über Befundvorlage',
        
        err_unknown_node_type: 'FEHLER: Unbekannter Node Typ = ',
        err_element_not_specified: 'FEHLER: Element ist in MRRT nicht spezifiziert -> ignoriert: ',
        err_form_not_specified: 'FEHLER: Form Element ist in MRRT nicht spezifiziert: ',
        err_element_ignored: 'FEHLER: Element wird von MRRT ignoriert: ',
        err_text_has_no_parent: 'FEHLER: Text Node hat kein Eltern-Element: ',
        err_selected_file_not_html: 'FEHLER: Gewählte Datei ist keine HTML Datei: ',
        err_could_not_load_template: 'FEHLER: Kann Template nicht laden: ',
        err_unsupportet_scheme: 'FEHLER: Nicht unterstütztes URL-Schmea zum Start von EasyRad: ',
    }
};

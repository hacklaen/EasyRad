/* 
 * This file is intended to give the user the possibility to configure the list 
 * of favored templates individally.
 * 
 * - Each template is defined in one subarray
 * - The first element contains the name of the template displayed in the list
 * - The second element contains the relative URL of the template file
 *   -- The URL must be specified relative to the base directory of EasyRad, ie. index.html
 *   -- The relative URL may not contain spaces (especially the file name may
 *      not contain spaces or special characters)
 *      See: https://de.wikipedia.org/wiki/Uniform_Resource_Locator#Relative_URLs
 *      
 * NOTE: Filenames may not contain spaces!     
 * 
 * @author T. Hacklaender
 * @date 2018-06-11
 */

var favoredTemplates = [
   // Befundvorlagen der DRG (2018-05-29)
     ["CT-Thorax Lungenembolie", "templates/drg/CT-Thorax_Lungenembolie.html"],
     ["LTx-Evaluation HCC", "templates/drg/LTx-Evaluation_HCC.html"],
     ["MRT Rektum-Ca", "templates/drg/MRT_Rektum-Ca.html"],
     ["RECIST 1.1", "templates/drg/RECIST_1.1.html"],
     ["Ultraschall Carotis", "templates/drg/Ultraschall_Carotis.html"],
     ["Ultraschall Hüftscreening", "templates/drg/Ultraschall_Hüftscreening.html"],
     ["Ultraschall nach FAST-Protokoll", "templates/drg/Ultraschall_nach_FAST-Protokoll.html"],
    // The TOP 5 templates provided by RSNA (2018-0529)
    ["Chest Xray", "templates/rsna/Chest_Xray.html"],
    ["Chest Xray-2 Views", "templates/rsna/Chest_Xray-2_Views.html"],
    ["US Abdomen", "templates/rsna/US_Abdomen.html"],
    ["CT Brain", "templates/rsna/CT_Brain.html"],
    ["MR Brain", "templates/rsna/MR_Brain.html"],
    
    // Sample template
    ["Sample valid", "templates/samples/sample-valid.html"],
    ["DIN25300-1", "templates/samples/din25300.html"],
    ["CT Schaedel", "templates/samples/ct-schaedel.html"],
    ["CR Knochen", "templates/samples/cr-knochen.html"],
];



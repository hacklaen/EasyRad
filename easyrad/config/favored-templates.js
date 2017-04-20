/* 
 * This file is intended to give the user the possibility to configure the list 
 * of favored templates individally.
 * 
 * - Each template is defined in one subarray
 * - The first element contains the name of the template displayed in the list
 * - The second element contains the relative URL of the template file
 *   -- The URL must be specified relative to the file "easyreport.html"
 *   -- The relative URL may not contain spaces (especially the file name may
 *      not contain spaces or special characters)
 *      See: https://de.wikipedia.org/wiki/Uniform_Resource_Locator#Relative_URLs
 */

var favoredTemplates = [
    // The TOP 5 templates provided by RSNA (2017-04-20)
    ["Chest Xray (en)", "./templates/Chest_Xray_RSNA.html"],
    ["Chest Xray - 2 Views (en)", "./templates/Chest_Xray_2_Views_RSNA.html"],
    ["US Abdomen (en)", "./templates/US_Abdomen_RSNA.html"],
    ["CT Brain (en)", "./templates/CT_Brain_RSNA.html"],
    ["MR Brain (en)", "./templates/MR_Brain_RSNA.html"],
    
    // Sample template
    ["IHE Sample (en)", "./samples/IHE_MRRT_Example_TI_TH.html"],
];



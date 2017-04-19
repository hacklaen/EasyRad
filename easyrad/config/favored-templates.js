/* 
 * Configuration of the list of favored templates
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
    // The TOP 5 templates provided by RSNA
    ["Chest Xray", "./templates/Chest_Xray_RSNA.html"],
    ["Chest Xray - 2 Views", "./templates/Chest_Xray_2_Views_RSNA.html"],
    ["US Abdomen", "./templates/US_Abdomen_RSNA.html"],
    ["CT Brain", "./templates/CT_Brain_RSNA.html"],
    ["MR Brain", "./templates/MR_Brain_RSNA.html"],
    
    // Sample template
    ["Demo", "./samples/IHE_MRRT_Example_TI_TH.html"],
];



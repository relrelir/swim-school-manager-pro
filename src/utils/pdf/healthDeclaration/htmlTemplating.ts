
import { HealthDeclarationType, ParticipantType } from "./types";

/**
 * Generates the HTML content for health declaration PDF
 */
export const generateHealthDeclarationHtml = (
  participant: ParticipantType,
  healthDeclaration: HealthDeclarationType,
  notes?: string | null
): HTMLDivElement => {
  console.log("Creating health declaration HTML template");
  
  // Create virtual declaration element with proper styling
  const virtualDeclaration = document.createElement('div');
  virtualDeclaration.id = 'virtual-health-declaration';
  virtualDeclaration.style.width = '800px';
  virtualDeclaration.style.height = '1200px';
  virtualDeclaration.style.padding = '40px';
  virtualDeclaration.style.position = 'fixed';
  virtualDeclaration.style.top = '10px';  // Position in viewport but out of normal flow
  virtualDeclaration.style.left = '10px';
  virtualDeclaration.style.zIndex = '9999';
  virtualDeclaration.style.visibility = 'hidden'; // Hidden but still rendered
  virtualDeclaration.style.overflow = 'visible';
  virtualDeclaration.style.backgroundColor = 'white';
  virtualDeclaration.style.direction = 'rtl';
  
  // Add font style to ensure it loads
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
    
    /* Direct font embedding */
    @font-face {
      font-family: 'Assistant';
      src: url('https://fonts.gstatic.com/s/assistant/v18/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnIGSV35Gu.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F;
    }
    
    #virtual-health-declaration * {
      font-family: 'Assistant', Arial, sans-serif !important;
      direction: rtl;
    }
    
    #virtual-health-declaration h1, 
    #virtual-health-declaration h2, 
    #virtual-health-declaration h3, 
    #virtual-health-declaration p,
    #virtual-health-declaration div {
      font-family: 'Assistant', Arial, sans-serif !important;
      direction: rtl;
    }
  `;
  virtualDeclaration.appendChild(style);
  
  // Build declaration HTML with improved styling
  virtualDeclaration.innerHTML += `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 28px; margin-bottom: 10px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הצהרת בריאות</h1>
      <p style="font-size: 14px; color: #666; font-family: Assistant, Arial, sans-serif !important;">${new Date().toLocaleDateString('he-IL')}</p>
    </div>
    
    <div style="margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
      <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">פרטי המשתתף:</h3>
      <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">שם מלא:</span> ${participant.firstname} ${participant.lastname}</p>
      <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">ת.ז.:</span> ${participant.idnumber || ''}</p>
      <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">טלפון:</span> ${participant.phone || ''}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הצהרה:</h3>
      <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
        <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• המשתתף נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
        <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
        <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
        <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• אני מתחייב/ת להודיע למדריכים על כל שינוי במצבו הבריאותי.</p>
      </div>
    </div>
    
    ${notes ? `
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הערות רפואיות:</h3>
      <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;">${notes}</p>
    </div>
    ` : ''}
    
    <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
      <div style="margin-bottom: 30px;">
        <p style="font-weight: bold; margin-bottom: 5px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">חתימת ההורה/אפוטרופוס:</p>
        <div style="height: 40px; border-bottom: 1px dashed #999; width: 250px;"></div>
      </div>
      
      <div>
        <p style="font-weight: bold; margin-bottom: 5px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">תאריך:</p>
        <div style="height: 40px; border-bottom: 1px dashed #999; width: 120px;"></div>
      </div>
    </div>
  `;
  
  return virtualDeclaration;
};

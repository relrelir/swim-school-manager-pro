
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/**
 * This is the font definition file for Alef Regular
 */
(function (jsPDF) {
  var font = 'Alef-Regular';
  var callAddFont = function () {
    try {
      // Add font to the virtual file system
      this.addFileToVFS(font + '.ttf', '/fonts/Alef-Regular.ttf');
      // Register the font for use with normal weight text
      this.addFont(font + '.ttf', 'Alef', 'normal');
    } catch (error) {
      console.error("Error adding Alef Regular font:", error);
    }
  };
  
  // Check if jsPDF exists and has the API property
  if (typeof jsPDF !== 'undefined' && jsPDF.API) {
    jsPDF.API.events.push(['addFonts', callAddFont]);
  } else if (typeof window !== 'undefined' && window.jsPDF && window.jsPDF.API) {
    window.jsPDF.API.events.push(['addFonts', callAddFont]);
  } else {
    console.warn("jsPDF not found when loading Alef-Regular font");
  }
})(typeof window !== 'undefined' && window.jsPDF ? window.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : {}));

})));

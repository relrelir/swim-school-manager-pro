
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/**
 * This is the font definition file for Alef Bold
 */
(function (jsPDF) {
  var font = 'Alef-Bold';
  var callAddFont = function () {
    // Add font to the virtual file system
    this.addFileToVFS(font + '.ttf', '/fonts/Alef-Bold.ttf');
    // Register the font for use with bold weight text
    this.addFont(font + '.ttf', 'Alef', 'bold');
  };
  jsPDF.API.events.push(['addFonts', callAddFont]);
})(jsPDF);

})));

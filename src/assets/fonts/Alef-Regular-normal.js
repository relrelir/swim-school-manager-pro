
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
    // Add font to the virtual file system
    this.addFileToVFS(font + '.ttf', '/fonts/Alef-Regular.ttf');
    // Register the font for use with normal weight text
    this.addFont(font + '.ttf', 'Alef', 'normal');
  };
  jsPDF.API.events.push(['addFonts', callAddFont]);
})(jsPDF);

})));

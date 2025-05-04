
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/**
 * This is a minimal stub file for Roboto font
 * The actual font data would be included in a real implementation
 * This is just a placeholder for the structure
 */
(function (jsPDF) {
  var font = 'Roboto-Regular';
  var callAddFont = function () {
    this.addFileToVFS(font + '.ttf', '');
    this.addFont(font + '.ttf', 'Roboto', 'normal');
  };
  jsPDF.API.events.push(['addFonts', callAddFont]);
})(jsPDF);

})));

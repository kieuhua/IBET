/*
 * ibet.js
 * Root namespace module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, ibet */

var ibet = (function () {
  'use strict';
  var initModule = function ( $container ) {
    ibet.data.initModule();
    ibet.model.initModule();
    ibet.shell.initModule( $container );
  };

  return { initModule: initModule };
}());

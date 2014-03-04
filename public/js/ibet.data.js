/*
 * ibet.data.js
 * Avatar feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, io, ibet */
ibet.data = (function () { 
  'use strict';
  var
    stateMap = { sio : null },
    makeSio, getSio, initModule;

  makeSio = function (){
    console.log("client data before io connect to bet namespace");
    var socket = io.connect( '/bet' );
    
    return {
      emit : function ( event_name, data ) {
        socket.emit( event_name, data );
      },
      on : function ( event_name, callback ) {
        socket.on( event_name, function (){
          callback( arguments );
        });
      }
    };
  };
 
  getSio = function () {
     console.log("client data in getSio");
    if ( ! stateMap.sio ) { stateMap.sio = makeSio(); }
    return stateMap.sio;
  };
  
  initModule = function (){};
  
  return {
    getSio     : getSio,
    initModule : initModule
  }; 
}());
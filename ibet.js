/*
 * ibet.js - Express server with routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// -------------------- BEGIN MODULE SCOPE VARIABLES ---------------
'use strict';
var 
  http    = require( 'http'         ),
  express = require( 'express'      ),
  routes  = require( './lib/routes' ),
   socket = require( 'socket.io' ),

  ibet     = express(),
  server  = http.createServer( ibet ),
  listbroadcast;
// ----------------- END MODULE SCOPE VARIABLES ---------------

// ----------------- BEGIN SERVER CONFIGURATION ---------------
ibet.configure( function () {
  ibet.use( express.bodyParser() );
  ibet.use( express.methodOverride() );
  ibet.use( express.static( __dirname + '/public' ) );
  ibet.use( ibet.router );
});

ibet.configure( 'development', function () {
  ibet.use( express.logger() );
  ibet.use( express.errorHandler({
    dumpExceptions : true,
    showStack      : true
  }) );
});

ibet.configure( 'production', function () {
  ibet.use( express.errorHandler() );
});

routes.configRoutes( ibet, server );
// ----------------- END SERVER CONFIGURATION -----------------

// ----------------- BEGIN START SERVER -----------------------
server.listen( process.env.PORT || 5000 );

console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, ibet.settings.env
);
// ----------------- END START SERVER -------------------------

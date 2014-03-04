/*
 * bet.js - module to provide bet messaging
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------------- BEGIN MODULE SCOPE VARIABLES ------------
'use strict';
var
  signIn, signOut, betObj,
  socket = require( 'socket.io' ),
  crud   = require( './crud'    ),
  
  makeMongoId = crud.makeMongoId,
  betterMap  = {},
  playerList = [], waitingList = [], listbroadcast, winnerbroadcast, lastwinner,
  userCheck;

// ------------------- END MODULE SCOPE VARIABLES ---------

// ------------------- BEGIN UTILITY METHODS ---------

listbroadcast = function ( io, event, result_list) {
  io.of( '/bet' ).emit( event, result_list );
};

winnerbroadcast = function ( io, event, result_list) {
     io.of( '/bet' ).emit( event, result_list[0] );
};

signIn = function ( io, user_map, socket ) {
  var name = user_map.name, isLimitwaiting = false;
  
  crud.update(
    'user',
    { '_id'     : user_map._id },
    { is_online : true         },
    function ( result_map ) {
      user_map.is_online = true;
      
      // time to write util userCheck( name, userlist ) => true/false
      if ( !userCheck(name, playerList) ) {
         // no in playerList
         if ( playerList.length < 5 ) {
            playerList.push( name );
         } else {
            // now check the waitng           
            if ( !userCheck(name, waitingList) ) {
               if ( waitingList.length < 10 ) {
                  waitingList.push( name );
               } else {
                  isLimitwaiting = true;
               }
            } // else user is in waitingList, do not add
         }
      } else {
         // user is in the playerList, it means user is already on one of browser
         // I need to check to see if the user on-line, then send out alert message
         // to implement one user one login, I will do somethind here         
      }
            
      socket.emit( 'userupdate', user_map );
      if ( lastwinner ) {
         socket.emit( 'lastwinner', lastwinner );
      }           
      listbroadcast( io, 'updateplayers', playerList);  
      listbroadcast( io, 'updatewaiting', waitingList);
      
      if ( isLimitwaiting ) {
         socket.emit( 'limitwaiting' );
      }
    }
  );
  betterMap[ user_map._id ] = socket;
  socket.user_id = user_map._id;
};

// signOut - update is_online property and betterMap
//
signOut = function ( io, user_id ) {
  crud.update(
    'user',
    { '_id'     : user_id },
    { is_online : false   },
    function ( result_list ) {  }
  );
  delete betterMap[ user_id ];
};

// time to write util userCheck( name, userlist ) => true/false
userCheck = function ( name, userlist) {
  var i;
  for ( i = 0; i < userlist.length; i++ ) {
    if ( userlist[i] === name ) {
	   return true;
    }
  }
  return false;
};
// ------------------- END UTILITY METHODS ---------

// ------------------- BEGIN PUBLIC METHODS ---------
betObj = {
  connect : function ( server ) {
    var io = socket.listen( server );

    // Begin io setup
    io
      .set( 'blacklist' , [] )
      .of( '/bet' )
      .on( 'connection', function ( socket ) {
           socket.on( 'adduser', function ( user_map ) {
             // try to read in the user
             crud.read(
               'user',
               { name : user_map.name },
               {},
               function ( result_list ) {
                 var
                   result_map, cid = user_map.cid, current_name, isLimitwaiting = false;

                 delete user_map.cid;

                 // use existing user with provided name
                 if ( result_list.length > 0 ) {
                   result_map     = result_list[ 0 ];
                   result_map.cid = cid;        
                   signIn( io, result_map, socket );
                 }

                 // create user with new user
                 else {
                   user_map.is_online = true;
                   // before you create new user in DB
                   crud.construct( 'user', user_map,
                     function ( result_list ) {
                       // after it inserted in DB, it will come back here
                       result_map     = result_list[ 0 ];                                                       
                       result_map.cid = cid;
                       betterMap[ result_map._id ] = socket;
                       socket.user_id = result_map._id;
                       socket.emit( 'userupdate', result_map );
                       if ( lastwinner ) {
                          socket.emit( 'lastwinner', lastwinner );
                        }
                       current_name = result_map.name;
                       if ( playerList.length < 5 ) {                         
                         playerList.push( current_name );                                               
                       } 
                       else {
                         if ( waitingList.length < 10 ) {
                            waitingList.push ( current_name );
                         } else {                          
                            isLimitwaiting = true;                     
                         }                                          
                       }                      
                       
                       listbroadcast( io, 'updateplayers', playerList);                     
                       listbroadcast( io, 'updatewaiting', waitingList);                   
                       
                       if ( isLimitwaiting ) {
                          socket.emit( 'limitwaiting' );
                          if ( lastwinner ) {
                             socket.emit( 'lastwinner', lastwinner );
                          }
                       }
                     }
                   );
                 }
               }
             );
           });
           // End /adduser/ message handler
           
        socket.on( 'play', function( name ) {
          var  winner, winnerIdx, amount, i;
          
          if ( waitingList.indexOf( name) !== -1 ) {
             socket.emit( 'playwait');
             return;
          }
   
           if ( playerList.indexOf( name ) === -1 ) {
              socket.emit( 'noplay');
              return;
           }
          
           /* if player */
           // return a random number between 0 and playerList length
           winnerIdx = Math.floor( (Math.random() * playerList.length) );
           winner = playerList[winnerIdx];
           amount = 5000 * (playerList.length);
         
           // BIG MISTAKE, NEED TO SET playerList to empty array NOT NULL????
           playerList = [];
           for (i=0; i<5; i++) {
             if ( !waitingList[0]) {
               break;
             } else {
                playerList[i] = waitingList[0];
                waitingList.shift();
             }         
           }
           lastwinner = { winner : winner, amount : amount };
           winnerbroadcast( io, 'played', [{ winner : winner, amount : amount }] );        

           listbroadcast( io, 'updateplayers', playerList);              
           listbroadcast( io, 'updatewaiting', waitingList);                 
        }); // end of on 'play'
        
        socket.on( 'removeplay', function( name ) {
           var userIdx;
           userIdx = playerList.indexOf( name );
           if ( userIdx !== -1 ) {
              playerList.splice( userIdx, 1 );
              listbroadcast( io, 'updateplayers', playerList );
           }
           
           userIdx = waitingList.indexOf( name );
             if ( userIdx !== -1 ) {
                waitingList.splice( userIdx, 1 );
                listbroadcast( io, 'updatewaiting', waitingList );
             }           
        }); // end of on 'removeplay'
        
        socket.on( 'betinfo', function() {
            listbroadcast( io, 'updateplayers', playerList );
            listbroadcast( io, 'updatewaiting', waitingList );
            if ( lastwinner ) {
               socket.emit( 'lastwinner', lastwinner );
            }
        });

        socket.on( 'disconnect', function () {
          console.log(
            '** user %s closed browser window or tab **',
            socket.user_id
         
          );
          signOut( io, socket.user_id );
        });
        // End disconnect methods
      }
    );
    // End io setup

    return io;
  }
};

module.exports = betObj;
// ------------------- END PUBLIC METHODS ---------
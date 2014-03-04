/*
 * ibet.fake.js
 * Fake module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, ibet */

ibet.fake = (function () {
  'use strict';
  NO_CHANGE  = 0;
  IS_PLAYER = 1;
  IS_WAITING = 2;
  
  var peopleList, fakeIdSerial, makeFakeId, mockSio,
   playerList = [], waitingList = [], type_list = 0,
   NO_CHANGE  = 0, IS_PLAYER = 1, IS_WAITING = 2;

  fakeIdSerial = 5;

  makeFakeId = function () {
    return 'id_' + String( fakeIdSerial++ );
  };

  peopleList = [
    { name : 'Kieu', _id : 'id_01',
      css_map : { top: 20, left: 20,
       'background-color' : 'rgb( 128, 128, 128)'
      }
    },
    { name : 'Richard', _id : 'id_02',
      css_map : { top: 60, left: 20,
        'background-color' : 'rgb( 128, 255, 128)'
      }
    },
    { name : 'Trill', _id : 'id_03',
      css_map : { top: 100, left: 20,
        'background-color' : 'rgb( 128, 192, 192)'
      }
    },
    { name : 'Francine', _id : 'id_04',
      css_map : { top: 140, left: 20,
        'background-color' : 'rgb( 192, 128, 128)'
      }
    }
  ];

  mockSio = (function () {
    var on_sio, emit_sio, emit_mock_msg,
    send_listchange, listchange_idto,
    callback_map = {};

    on_sio = function ( msg_type, callback ) {
      callback_map[ msg_type ] = callback;
    };

    emit_sio = function ( msg_type, data ) {
      var person_map;

      // respond to 'adduser' event with 'userupdate'
      // callback after a 3s delay
      //
      if ( msg_type === 'adduser' && callback_map.userupdate ) {
        setTimeout( function () {
          person_map = {
            _id : makeFakeId(),
            name : data.name,
            css_map : data.css_map
          };
          
          peopleList.push( person_map );
          
          if ( playerList.length < 5 ) {
          	playerList.push( person_map.name);
          	type_list = IS_PLAYER;
          } else {
          	waitingList.push( person_map.name);			
          	type_list = IS_WAITING = 2;
          }
          
          /* then call 'userupdate' callback */
          callback_map.userupdate([ person_map ], type_list);
        }, 3000 );
      }      

    };            
    
    // We have to start the process ...
    //send_listchange();

    return { emit : emit_sio, on : on_sio };
  }());  // end of mockSkio

  return { mockSio       : mockSio };
}()); // endo of fake module

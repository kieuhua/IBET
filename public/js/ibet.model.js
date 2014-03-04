/*
 * ibet.model.js
 * Model module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, ibet */

ibet.model = (function () {
  'use strict';
  var
    configMap = { anon_id : 'a0' },
    stateMap  = {
      anon_user      : null,
      cid_serial     : 0,
      is_connected   : false,
      people_cid_map : {},
      people_db      : TAFFY(),
      user           : null
    },

    //isFakeData = true,
    isFakeData = false,

    personProto, makeCid, clearPeopleDb, completeLogin,
    makePerson,removePerson, people, initModule,
    
    // array of unique names
    playerList = [], waitingList = [],
    updatePlayers, updateWaiting, lastWinner,
    play, onPlaywait, noPlay, onPlayed,
    noPlayers, noWaiting, limitWaiting, limitOne,
    removeme, betinfolist;  
     
  personProto = {
    get_is_user : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };
  
  makeCid = function () {
    return 'c' + String( stateMap.cid_serial++ );
  };
  
  clearPeopleDb = function () {
    var user = stateMap.user;
    stateMap.people_db = TAFFY();
    stateMap.people_cid_map = {};
    if ( user ) {
      stateMap.people_db.insert( user );
      stateMap.people_cid_map[ user.cid ] = user;
    }
  };

  completeLogin = function ( user_list ) {    
    var user_map = user_list[0];
    
     delete stateMap.people_cid_map[ user_map.cid ];

    stateMap.user.cid     = user_map._id;
    stateMap.user.id      = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;  
    $.gevent.publish( 'ibet-login', [ stateMap.user ] );
  };
  
  updatePlayers = function ( playerslist ) {
    playerList = playerslist;
    $.gevent.publish( 'ibet-players-ui', playerList );
  };
  
  updateWaiting = function ( waitinglist ) {
    waitingList = waitinglist;
    $.gevent.publish( 'ibet-waiting-ui', waitingList );
  };
  
  lastWinner = function ( result_list ) {
     var winner, amount;
     winner = result_list[0].winner;
     amount = result_list[0].amount;
     $.gevent.publish( 'ibet-played', { winner : winner, amount : amount });    
  };
  
  onPlaywait = function ( ) {
    $.gevent.publish( 'play-wait' );
  };
  
  noPlay = function ( ) {
     $.gevent.publish( 'no-play' );
  };
  
  onPlayed = function( result_list ) {
     var winner, amount;
     winner = result_list[0].winner;
     amount = result_list[0].amount;
    $.gevent.publish( 'ibet-played', { winner : winner, amount : amount });    
  };
  
  noPlayers = function() {
     $.gevent.publish( 'no-players' );
  };
  
  noWaiting = function() {
     $.gevent.publish( 'no-waiting' );
  };
  
  limitWaiting = function() {
    $.gevent.publish( 'limit-waiting' ); 
  };
  
  limitOne = function () {
     $.gevent.publish( 'limit-one' ); 
   };

  makePerson = function ( person_map ) {
    var person,
      cid     = person_map.cid,
      css_map = person_map.css_map,
      id      = person_map.id,
      name    = person_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    person         = Object.create( personProto );
    person.cid     = cid;
    person.name    = name;
    person.css_map = css_map;

    if ( id ) { person.id = id; }

    stateMap.people_cid_map[ cid ] = person;

    stateMap.people_db.insert( person );
    return person;
  };
  
  removePerson = function ( person) {
    if ( ! person ) { return false; }
    // can't remove anonyous person
    if ( person.id === configMap.anon_id ) {
      return false;
    }
    
    stateMap.people_db({ cid : person.cid }).remove();
    if ( person.cid ) {
      delete stateMap.people_cid_map[ person.cid ];
    }
    return true;
  };

  people = (function () {
    var get_by_cid, get_db, get_user, login, logout;
    
    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };
       
    get_db = function () { return stateMap.people_db; };
    
    get_user = function () { return stateMap.user; };
    
    login = function ( name ) {
      var sio = isFakeData ? ibet.fake.mockSio : ibet.data.getSio();

      /* if name is not on these two lists then create a new user */
      stateMap.user = makePerson({
        cid : makeCid(),
        css_map : {top : 25, left : 25, 'background-color':'#8f8'},
        name : name
      });
      
      sio.on( 'userupdate'     , completeLogin  );
      sio.on( 'updateplayers' , updatePlayers  );
      sio.on( 'updatewaiting' , updateWaiting );
      sio.on( 'played', onPlayed );
      sio.on( 'lastwinner', lastWinner );
      sio.on( 'limitwaiting', limitWaiting );
      sio.on( 'nowaiting', noWaiting );
      sio.on( 'limitone', limitOne );
      
      sio.emit( 'adduser', {
        cid : stateMap.user.cid,
        css_map : stateMap.user.css_map,
        name : stateMap.user.name
      });
    };
    
    logout = function () {
      var user = stateMap.user;
      
      stateMap.user = stateMap.anon_user;
      clearPeopleDb();     
      $.gevent.publish( 'ibet-logout', [ user ] );
    };
    
    play = function ( name ) {
      var sio = isFakeData ? ibet.fake.mockSio : ibet.data.getSio();
                          
      sio.on( 'playwait', onPlaywait );
      sio.on( 'noplay', noPlay );
      sio.on( 'noplayers', noPlayers );
      sio.emit( 'play', name );           
    };
    
    removeme = function ( name ) {
      var sio = isFakeData ? ibet.fake.mockSio : ibet.data.getSio();
      sio.emit( 'removeplay', name );
    };
    
    betinfolist = function () {
      var sio = isFakeData ? ibet.fake.mockSio : ibet.data.getSio();
      sio.on( 'updateplayers' , updatePlayers  );
      sio.on( 'updatewaiting' , updateWaiting );
      sio.on( 'lastwinner', lastWinner );
      sio.emit( 'betinfo');
    };
    
    return {
      get_by_cid : get_by_cid,
      get_db     : get_db,
      get_user   : get_user,
      login      : login,
      logout     : logout,
      play       : play,
      removeme   : removeme,
      betinfolist : betinfolist
    };
  }());
  
  initModule = function () {
    // initialize anonymous person
    stateMap.anon_user = makePerson({
      cid   : configMap.anon_id,
      id    : configMap.anon_id,
      name  : 'anonymous'
    });    
    stateMap.user = stateMap.anon_user;
    
  };

  return {
    initModule : initModule,
    people     : people
  };
}());

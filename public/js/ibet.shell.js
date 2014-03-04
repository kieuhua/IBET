/*
 * ibet.shell.js
 * Shell module for IBET
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, ibet */

ibet.shell = (function () {
   'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES ------------
  var
    configMap = {
      resize_interval : 200,
      main_html : String()
        + '<div class="ibet-shell-head">'      
          + '<div class="ibet-shell-head-logo">'
            + '<p class="ibet-shell-head-logo-text">IBET</p>'
          + '</div>'
          + '<div class="ibet-shell-head-winner"></div>'
          + '<div class="ibet-shell-head-acct"></div>'
        + '</div>'
        + '<div class="ibet-shell-main">'
        
          + '<div class="ibet-shell-main-players">'
            + '<div class="ibet-shell-main-players-label">'
               + '<p class="ibet-shell-main-players-label-text">Players</p>'
             + '</div>'
            + '<div class="ibet-shell-main-players-list"></div>'
          + '</div>'
          
          + '<div class="ibet-shell-main-content">'
            + '<div class="ibet-shell-main-content-play">'
          		+ '<p class="ibet-shell-main-content-play-text">PLAY</p>'
          	+ '</div>'
          	+ '<div class="ibet-shell-main-content-avatars">'
          		+ '<div class="ibet-shell-main-content-avatar0">Available</div>'
          		+ '<div class="ibet-shell-main-content-avatar1">Available</div>'
          		+ '<div class="ibet-shell-main-content-avatar2">Available</div>'
          		+ '<div class="ibet-shell-main-content-avatar3">Available</div>'
          		+ '<div class="ibet-shell-main-content-avatar4">Available</div>'
          	+ '</div>'
          	+ '<div class="ibet-shell-main-content-bet">'
          	   + '<div class="ibet-shell-main-content-bet-removemebtn">Remove Me</div>'	
          	   + '<div class="ibet-shell-main-content-bet-eachbet">$5000 Each</div>'				
          		+ '<div class="ibet-shell-main-content-bet-addmebtn">Add Me</div>'
          	+ '</div>'
          + '</div>'
          
          + '<div class="ibet-shell-main-waiting">'
            + '<div class="ibet-shell-main-waiting-label">'
          		+ '<p class="ibet-shell-main-waiting-label-text">Waiting</p>'
          	+ '</div>'
          	+ '<div class="ibet-shell-main-waiting-list"></div>'
          + '</div>'
        + '</div>'
        + '<div class="ibet-shell-foot">'
            + '<div class="ibet-shell-foot-warning">'
        			+ '<p class="ibet-shell-foot-warning-text">Do not play if you do not have money to throw away!!!</p>'
        		+ '</div>'
        + '</div>'
    },
    stateMap  = { 
      $container : undefined,
      resize_idto : undefined
    },
    jqueryMap = {},

   setJqueryMap, onResize,      
    onTapAcct, onLogin, onLogout,
    initModule, 
    draw_players, draw_avatars, draw_waiting, 
    onPlayers, onWaiting, 
    onTapPlay, onPlaywait, noPlay, onPlayed,
    noPlayers, noWaiting, onLimitwaiting,
    onTapAddme, onTapRemoveme, onLimitone,
    current_user, i;
  //--------------- END MODULE SCOPE VARIABLES ----------------

  //--------------- BEGIN UTILITY METHODS ---------------------
  draw_avatars =  function ( playerlist ) {
    var i_avatar_class, i_box;
 
    for( i= 0; i< 5; i++) {
      i_avatar_class = ".ibet-shell-main-content-avatar" + i ;
  		i_box = stateMap.$container.find(i_avatar_class);
  		if ( playerlist[i] )	{
  		   i_box.text( playerlist[i] );
  		} else {
  		   i_box.text( "Available" );
  		}
  	 }     
  };
  draw_players = function ( playerlist ) {
    jqueryMap.$players.text("");
    
    // need to replace "Available" instead of "null"
    // need to check for playerList undefined
    if ( !playerlist ) {
        alert( "There is no one in Players list");
        return;
     }
    for( i= 0; i< playerlist.length; i++) {  
       if ( playerlist[i] ) {   
          jqueryMap.$players.append( playerlist[i] + "<br>" );
       }
    }
  };
  draw_waiting = function ( waitinglist ) {
    jqueryMap.$waiting.text("");
    
     // need to check for waitingList undefined
    if ( !waitinglist ) {
       alert( "There is no one in Waiting list");
       return;
    }
    for( i= 0; i< waitinglist.length; i++) {
      jqueryMap.$waiting.append( waitinglist[i] + "<br>" );
    }
  };
  //--------------- END UTILITY METHODS -----------------------

  //--------------- BEGIN DOM METHODS -------------------------
  // Begin Dom method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = { 
       $container : $container,
       $acct : $container.find('.ibet-shell-head-acct'),
       $players : $container.find('.ibet-shell-main-players-list'),
       $waiting : $container.find('.ibet-shell-main-waiting-list'),
       $playbtn : $container.find('.ibet-shell-main-content-play'),
       $winner  : $container.find('.ibet-shell-head-winner'),
       $addmebtn  : $container.find('.ibet-shell-main-content-bet-addmebtn'),
       $removemebtn : $container.find('.ibet-shell-main-content-bet-removemebtn')
    };
  };
  // END DOM method /setJqueryMap/

  
  //--------------- BEGIN EVENT HANDLERS ----------------------
  
  // Begin Event handler /onResize/
  onResize = function (){
    if ( stateMap.resize_idto ){ return true; }
   
    stateMap.resize_idto = setTimeout(
      function (){ stateMap.resize_idto = undefined; },
      configMap.resize_interval
    );
    /* this event will buble up to window, and window will take care it */
    return true;
  };
  // End Event handler /onResize/
  
  onTapAcct = function ( event ) {
    var user_name, user;
    
    user = ibet.model.people.get_user();
    
    // if user in stateMap.user is anon
    if ( user.get_is_anon() ) {
      user_name = prompt( 'Please sign-in' );  
      ibet.model.people.login( user_name );
      jqueryMap.$acct.text( '... processing ...' );
    }
    else {
      ibet.model.people.logout();
    }
    /* return false is important why??
    because, we want the event stop buble up to ibet.js
    for we are taking care it already.
    */
    return false;
  };
  
  onTapPlay = function ( event ) {
    // current_user is object current_user.name property
    if ( !current_user ) {  
      alert("You need to login to play!!!");
      return;
    }
   ibet.model.people.play( current_user.name );
   return false;             
  };
  
  onTapAddme = function ( event ) {
    if ( !current_user ) {
      alert("You need to login to play!!!");
    } else {
      ibet.model.people.login( current_user.name );
    }
  };
  
  onTapRemoveme = function ( event ) {
    if ( !current_user ) {
       alert("You need to login to do thing!!!");
    } else {
       ibet.model.people.removeme( current_user.name );
       return false;
    }
  };
  
  onLogin = function ( event, login_user ) {
     current_user = login_user;
    jqueryMap.$acct.text( login_user.name );   
  };
  
  onPlayers = function ( event, result_list ) {
     draw_players( result_list[0] );
     draw_avatars( result_list[0] );
  };
  
  onWaiting = function ( event, result_list ) {
     draw_waiting( result_list[0] );
  };
  
  onPlaywait = function ( event ) {
     alert("You need to wait for your turn!!! You are in waiting list now.");
  };
  
  noPlay = function ( event ) {
     alert("You are not on the Players list, you cann't play. You need to click 'Add Me' button.");
  };
  
  onPlayed = function ( event, result_map ) {
     var winner, amount, winner_text;
     winner = result_map.winner;
     amount = result_map.amount;
     winner_text = "The last winner is " + winner + " for " + "$ " + amount + " !!!";
     jqueryMap.$winner.text( winner_text );
  };
  
  noPlayers = function ( event ) {
     alert("There is no players");
  };
  
  noWaiting = function ( event ) {
     alert("There is no waiting");
  };
  
  onLimitwaiting = function ( event ) {
    alert("There is no room on the waiting list. Please check out our chat room, while you are waiting."); 
  };
  
  onLimitone = function ( event ) {
    alert("You can only login into one browser."); 
  };
  
  onLogout = function ( event, logout_user ) {
    jqueryMap.$acct.text( 'Please sign-in' );
  };
  //--------------- END EVENT HANDLERS ------------------------
  
  //--------------- END CALLBACKS ---------------------------

  //--------------- BEGIN PUBLIC METHODS ----------------------
  initModule = function ( $container ) {
    // load html and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    
    // need the playerList, waitingList, last winner
    ibet.model.people.betinfolist();
    setJqueryMap();

    // configure and initialize feature modules
    ibet.model.initModule();   

    $(window).bind( 'resize', onResize );
      
    $.gevent.subscribe( $container, 'ibet-login', onLogin );
    $.gevent.subscribe( $container, 'ibet-logout', onLogout );
    
    $.gevent.subscribe( $container, 'ibet-players-ui', onPlayers );
    $.gevent.subscribe( $container, 'ibet-waiting-ui', onWaiting );
    
    $.gevent.subscribe( $container, 'play-wait', onPlaywait );
    $.gevent.subscribe( $container, 'no-play', noPlay );
    $.gevent.subscribe( $container, 'ibet-played', onPlayed );
    
     $.gevent.subscribe( $container, 'no-players', noPlayers );
     $.gevent.subscribe( $container, 'no-waiting', noWaiting );
     
     $.gevent.subscribe( $container, 'limit-waiting', onLimitwaiting );
     $.gevent.subscribe( $container, 'limit-one', onLimitone );
     
      
    jqueryMap.$acct
      .text( 'Please sign-in')
      .bind( 'utap', onTapAcct );
    jqueryMap.$playbtn
      .bind( 'utap', onTapPlay );
    jqueryMap.$addmebtn
      .bind( 'utap', onTapAddme );
    jqueryMap.$removemebtn
      .bind( 'utap', onTapRemoveme )
  };
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //--------------- END PUBLIC METHODS ------------------------   
}());





  			
  			
  			
  		
  		
  			
  			
  		
  		
  		

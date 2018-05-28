# IBET
It is example Javascript Single Page Application(JSA). It is a simple fun betting game. You just login with any name and play. 

### Screenshots
```
doc/screenshots
```
### IBET Software
IBET is JSA, it is written by Kieu Hua using the following software:
```
	- Express : it is a node.js web application framework.
	- mongoDB : it is non relational database, mongoDB is not mysql
	- JSV : Javascript validator, use for writing a schema for mongoDB.
	- socket.io: It uses WebSockets protocol to communicate with browsers. 
```

### Here are the rules
At least two players on the players list, then user can click on play button to see who is win . The maxium users on the players list is five, after that users will be put in waiting list.
```
	non-login users 
		click 'Play', 'Add Me' , 'Remove Me' => alert non-login messages		
	waiting users 
		click 'Play', 'Add Me' , 'Remove Me' => alert waiting users messages
	play users
		can click 'Play' any time
		can click 'Remove' to remove her/him from player list
	active login users ( who already played at least once)
		can click 'Add Me'

	Any player user can click 'Play' =>
		- The winner is picked, then the winner message will be posted.
		-  The waiting users will be shifted to become play users.
		-  The last play users (active login users) can click 'Add Me' to join the play users again.
	
Limitation: The maximum limit for waiting users is ten waiting users.
```

http://ibet88.herokuapp.com/ibet.html

Please send comments to "khua@xfsi.com"
Thank you for visiting

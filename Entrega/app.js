const RESOLUTION = {
  w: 640,
  h: 360,
};

const CONFIG = {
  width: RESOLUTION.w,
  height: RESOLUTION.h,
  scene: {
    create: create,
    update: update,
  },
};

// Core Game Setup
const WS = new WebSocket("ws://10.40.1.242:1657");

let start = false;

let game = new Phaser.Game(CONFIG);

let graphics;
let cursors;

let restartGame;

// Ball Setup
let ball_x = CONFIG.width * 0.5;
let ball_y = CONFIG.height * 0.5;

let ball_speed = 2;

let dir_y = "";
let dir_x = "";

// Players Setup 
let player_num = 0;

let player1_x = 16;
let player1_y = 32;


let player2_x = CONFIG.width - 32;
let player2_y = 32;

// Player Score Setup
let player1_score = 0;
let player2_score = 0;

let score1_text;
let score2_text;

// Victory Stat Setup

let victory1 = false;
let victory2 = false;

WS.onopen = (event) => {
  console.log("Connection Accepted");
};

WS.onmessage = (event) => {
	console.log(event.data);
	let data = JSON.parse(event.data);
	if(data.player_num != undefined){
		player_num = data.player_num;
	}
	if(data.start != undefined){
		console.log("START!!!");
		start = true;
	}
	if (data.player1_y != undefined){
		player1_y = data.player1_y;
		ball_x = data.ball_x;
		ball_y = data.ball_y;
	}
	if (data.player2_y != undefined){
		player2_y = data.player2_y;
	}
	if (data.player1Score != undefined){
		score1_text.text = data.player1Score;
	}
	if (data.player2Score != undefined){
		score2_text.text = data.player2Score;
	}
	if(data.victory1 != undefined){
		victory1 = data.victory1;
	}
	if(data.victory2 != undefined){
		victory2 = data.victory2;
	}
	if(data.restartGame != undefined){
	  restartGame = true;
	}
};

function create ()
{
	cursors = this.input.keyboard.createCursorKeys();
	graphics = this.add.graphics();

	graphics.fillStyle(0xffffff, 1);
	graphics.fillRect(player1_x, player1_y, 8, 48);
	graphics.fillRect(ball_x-4, ball_y-4, 8, 8);
	graphics.fillRect(player2_x, player2_y, 8, 48);

  score1_text = this.add.text(112,32,"0");
	score2_text = this.add.text(CONFIG.width-128,32,"0");


	let random = Math.floor(Math.random()*2);
	if(random == 0){
		dir_x = "Right";
		dir_y = "Up";
	}
	else{
		dir_x = "Left";
		dir_y = "Down";
	}
}

function restart (){
	player1_y = 32;
	player2_y = 32;
	
	ball_x = CONFIG.width/2;
	ball_y = CONFIG.height/2;
	
	restartGame = false;
}

function update(){
	
	if(!start || player_num == 0)
		return;

	if(restartGame){
		restart();
	}
	
	//CONTROL
	
	if(player_num == 1 && !victory1 && !victory2){
		if(ball_y == 0){
			dir_y = "Down";
		}
		if(ball_y == CONFIG.height - 8){
			dir_y = "Up";
		}
		if(ball_x == player1_x+8 && ball_y > player1_y && ball_y < player1_y + 48){
			dir_x = "Right";
		}

		if(ball_x == player2_x-8 && ball_y > player2_y && ball_y < player2_y + 48){
			dir_x = "Left";
		}	

		if(dir_y == "Up"){
			ball_y--;
		}
		else{
			ball_y++;
		}

		if(dir_x == "Right"){
			ball_x++;
		}
		else{
			ball_x--;
		}

		if(ball_x == 0){
			player2_score++;
			restartGame = true;
			let pos = '{"restartGame":true}';
			WS.send(pos);
			score2_text.text = player2_score;
			dir_x = "Right";
			dir_y = "Up";
			if(player2_score == 5){
				let pos = '{"victory2":true}';
				victory2 = true;
				WS.send(pos);
			}
		}
		if(ball_x == CONFIG.width - 8){
			player1_score++;
			restartGame = true;
			let pos = '{"restartGame":true}';
			WS.send(pos);
			score1_text.text = player1_score;
			dir_x="Left";
			dir_y="Down";
			if(player1_score == 5){
				let pos = '{"victory1":true}';
				victory1 = true;
				WS.send(pos);
			}
		}
	if(cursors.up.isDown){
		if(player1_y != 0){
			player1_y--;
		}
	}
	else if(cursors.down.isDown){
		if(player1_y + 48 != CONFIG.height){
			player1_y++;
		}
	}
}else if(player_num == 2 && !victory1 && !victory2){

		if(cursors.up.isDown){
		if(player2_y != 0){
			player2_y--;
			}
		}
		else if(cursors.down.isDown){
		if(player2_y + 48 != CONFIG.height){
			player2_y++;
			}
		}
}
	
	//Draw In Browser
	graphics.clear();

	if(!victory1 && !victory2){
		graphics.fillStyle(0xffffff, 1);
		graphics.fillRect(player1_x, player1_y, 8, 48);
		graphics.fillRect(ball_x, ball_y, 8, 8);
		graphics.fillRect(player2_x, player2_y, 8,48);
	}else if (victory1){
		if(player_num == 1){
			let winText = this.add.text(CONFIG.width/4, CONFIG.height/2, "You WIN!");
		}
		else if(player_num == 2){
			let winText = this.add.text(CONFIG.width/4, CONFIG.height/2, "You LOSE!");
		}
		else{
			let winText = this.add.text(CONFIG.width/4, config.height/2, "PLAYER 1 WINS!");
		}
	}else if(victory2){	
		if(player_num == 1){
			let winText = this.add.text(CONFIG.width/4, CONFIG.height/2, "You LOSE! :C ");
		}
		else if(player_num == 2){
			let winText = this.add.text(CONFIG.width/4, CONFIG.height/2, "You WIN!");
		}
		else{
			let winText = this.add.text(CONFIG.width/4, CONFIG.height/2, "PLAYER 2 WINS!");
		}
	}

	//Data Sending
	if(player_num == 1){
		let pos = '{"player1_y":'+player1_y+',';
		pos += '"ball_x":' + ball_x + ',"ball_y":' + ball_y + ',';
		pos += '"player1Score":' + player1_score + ',"player2Score":' + player2_score + '}';
		WS.send(pos);
	}
	else if (player_num == 2){
		let pos = '{"player2_y":' + player2_y + '}';
		WS.send(pos);
	}
}
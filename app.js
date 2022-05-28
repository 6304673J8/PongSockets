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

let game = new Phaser.Game(CONFIG);

const PLAYER_1 = {
  x: 16,
  y: 32,
  w: 8,
  h: 48,
};

const PLAYER_2 = {
  x: RESOLUTION.w - 32,
  y: 40,
  w: 8,
  h: 48,
};

const PLAYER_ONE_INIT_Y = 32;
const PLAYER_TWO_INIT_Y = 32;

const BALL = {
  x: RESOLUTION.w / 2,
  y: RESOLUTION.h / 2,
  w: 12,
  h: 12,
};

const SPEED = 2;
const BALL_SPEED = {
  x: Math.random() * SPEED + -SPEED,
  y: Math.random() * SPEED + -SPEED,
};

const WS = new WebSocket("ws://10.40.1.242:1657");

const ADD_BOUNCE = -0.15;

let cursors;
let graphics;

let playerNum = 0;
let restartGame;

let start = false;

WS.onopen = (event) => {
  console.log("Connection Accepted");
};

WS.onmessage = (event) => {
  console.log(event.data);
  let data = JSON.parse(event.data);
  if (data.player_num != undefined) {
    playerNum = data.player_num;
  } 
	else if (data.start != undefined) {
    console.log("START!!!");
    start = true;
  } 
	else if (data.player1_y != undefined) {
	  console.log("Player 1...Ready")
    PLAYER_1.y = data.player1_y;
    BALL.x = data.ball_x;
    BALL.y = data.ball_y;
  }
	else if (data.player2_y != undefined) {
    PLAYER_2.y = data.player2_y;
  }
	else if (data.player1_score != undefined) {
		score1_text.text = data.player1_score;
	}
	else if (data.player2_score != undefined) {
		score2_text.text = data.player2_score;
	}	
//
//	else if (data.restart != undefined) {
	//	restartTwo();
	//	scoreOne = data.scoreOne;
	//	scoreTwo = data.scoreTwo;

		//set_scores_text(scoreOne, scoreTwo);
	//}
};
let score1_text;
let score2_text;

let player1Score = 0;
let player2Score = 0;

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
	
  renderPlayerBall();
	
	score1_text = this.add.text(112, 32, "0");
	score1_text = this.add.text(RESOLUTION.w - 128, 32, "0");	
}

function restart () {
//	PLAYER_1 = PLAYER_ONE_INIT_X;
	PLAYER_1.y = PLAYER_ONE_INIT_Y;

//	PLAYER_2 = PLAYER_TWO_INIT_X;
	PLAYER_2.y = PLAYER_TWO_INIT_Y;

	BALL.x = RESOLUTION.w/2;
	BALL.y = RESOLUTION.h/2;

	restartGame = false;
	//BALL_SPEED.x *= (-1 + ADD_BOUNCE);
	//ball_angle = Math.floor(Math.random()*360)*Math.PI/180;
}

function update() {
  if (!start || playerNum == 0) return;
	if (!restartGame){
		graphics.fillStyle(0xffffff, 1);
	}

	if (restartGame) {
		restart();
	}
	
  if (playerNum == 1) {
    BALL.x += BALL_SPEED.x;
    BALL.y += BALL_SPEED.y;
  }

  inputManager();
  wallBounces();
	racketBounce();
  renderPlayerBall();
  sendData();
}

function sendData() {
  if (playerNum == 1) {
    let pos = '{"player1_y":'+PLAYER_1.y+',';
    pos += '"ball_x":'+BALL.x+',"ball_y":'+BALL.y+',';
    pos += '"player1_score":'+player1Score+',"player2_score":'+player2Score+'}';
    WS.send(pos);
  } else if (playerNum == 2) {
    let pos = '{"player2_y":'+PLAYER_2.y+'}';
    WS.send(pos);
  }
}

function wallBounces() {
  //Vertical
  if (BALL.y <= 0 || BALL.y > RESOLUTION.h) BALL_SPEED.y *= (-1 + ADD_BOUNCE);
	
  //Horizontal Left
  if (BALL.x <= 0){
		player2Score++;
		//restartGame = true;
		send_score();
		score2_text.text = player2Score;
		BALL_SPEED.y *= (-1 + ADD_BOUNCE);
	}

  //Horizontal Right
	if (BALL.x >= RESOLUTION.w - PLAYER_1.w){
		player1Score++;
		//restartGame = true;
		send_score();
		score1_text.text = player1Score;
		BALL_SPEED.y *= (-1 + ADD_BOUNCE);
	}
}

function racketBounce() {
	//Left Racket
	if (PLAYER_1.x <= BALL.x + BALL.w && PLAYER_1.x + PLAYER_1.w >= BALL.x){
		if (PLAYER_1.y <= BALL.y && PLAYER_1.y + PLAYER_1.h >= BALL.y){
			BALL_SPEED.x *= (-1 + ADD_BOUNCE);
		}
	}
	//Right Racket
	if (PLAYER_2.x <= BALL.x + BALL.w && PLAYER_2.x + PLAYER_2.w >= BALL.x){
		if (PLAYER_2.y <= BALL.y && PLAYER_2.y + PLAYER_2.h >= BALL.y) {
			BALL_SPEED.x *= (-1 + ADD_BOUNCE);
		}
	}
}

function send_score () {
	//let score = '{"restartGame":true,"score1":'+player1_score+', "score2": '+player2_score+'}';
	let score = '{"restartGame":true}';

	WS.send(score);
}

//function set_scores (){}
function inputManager() {
  if (playerNum == 1) {
    if (cursors.up.isDown) {
      PLAYER_1.y--;
    } else if (cursors.down.isDown) {
      PLAYER_1.y++;
    }
  } else if (playerNum == 2) {
    if (cursors.up.isDown) {
      PLAYER_2.y--;
    } else if (cursors.down.isDown) {
      PLAYER_2.y++;
    }
  }
}

function renderPlayerBall() {
  graphics.clear();
  graphics.fillStyle(0xffffff, 1);
  //Player 1
  graphics.fillRect(PLAYER_1.x, PLAYER_1.y, PLAYER_1.w, PLAYER_1.h);

  //player 2
  graphics.fillRect(PLAYER_2.x, PLAYER_2.y, PLAYER_2.w, PLAYER_2.h);

  //Ball
  graphics.fillRect(BALL.x, BALL.y, BALL.w, BALL.h);
}

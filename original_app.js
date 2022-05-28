const RESOLUTION = {
  w: 680,
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
let start = false;
let playerNum = 0;

WS.onopen = (event) => {
  console.log("Conexion aceptada");
};

WS.onmessage = (event) => {
  console.log(event.data);
  let data = JSON.parse(event.data);
  if (data.player_num != undefined) {
    playerNum = data.player_num;
  } else if (data.start != undefined) {
    console.log("START!!!");
    start = true;
  } else if (data.player1_y != undefined) {
	  console.log("Player 1...Ready")
    PLAYER_1.y = data.player1_y;
    BALL.x = data.ball_x;
    BALL.y = data.ball_y;
  } else if (data.player2_y != undefined) {
	  console.log("Player 2...Ready")
    PLAYER_2.y = data.player2_y;
  }
};

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
	
  renderPlayerBall();
}

function update() {
  if (!start || playerNum == 0) return;

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
    let pos = '{"player1_y":' + PLAYER_1.y + ",";
    pos += '"ball_x":' + BALL.x + "," + '"ball_y":' + BALL.y + "}";
    WS.send(pos);
  } else if (playerNum == 2) {
    let pos = '{"player2_y":' + PLAYER_2.y + "}";
    WS.send(pos);
  }
}

function wallBounces() {
  //Vertical
  if (BALL.y <= 0 || BALL.y > RESOLUTION.h) BALL_SPEED.y *= (-1 + ADD_BOUNCE);

  //Horizontal
  if (BALL.x <= 0 || BALL.x >= RESOLUTION.w) BALL_SPEED.x *= (-1 + ADD_BOUNCE);
}

function racketBounce() {
	//Left Racket
	if (BALL.x <= PLAYER_1.x + PLAYER_1.w) BALL_SPEED.x *= (-1 + ADD_BOUNCE); 
	//Right Racket
}

function restart () {
	PLAYER_1 = PLAYER_ONE_INIT_X;
	PLAYER_1 = PLAYER_ONE_INIT_Y;

	PLAYER_2 = PLAYER_TWO_INIT_X;
	PLAYER_2 = PLAYER_TWO_INIT_Y;

	BALL.x = RESOLUTION.w/2;
	BALL.y = RESOLUTION.h/2;

	BALL_SPEED.x *= (-1 + ADD_BOUNCE);
	//ball_angle = Math.floor(Math.random()*360)*Math.PI/180;
}

function send_score () {
	let score = '{"restart":true,"score1":'+score1+', "score2": '+score2+'}';

	WS.send(score);
}

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

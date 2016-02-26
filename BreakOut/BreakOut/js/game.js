window.onload = function () {
    var canvas = document.getElementById("c"),
      c = canvas.getContext("2d"),
      height = canvas.height,
      width = canvas.width,
      key = [];
    pause = false;
    score = 0;
    lives = 3;
    gameover = false;
    scene = 0;
    timer = 0;


    //key handling event
    document.addEventListener("keydown", function (e) {
        key[e.keyCode] = true;
    });
    document.addEventListener("keyup", function (e) {
        delete key[e.keyCode];
    });

    RIGHT = 39;
    UP = 38;
    DOWN = 40;
    LEFT = 37;
    CTRL = 17;
    P = 80;
    ENTER = 13;

    //-------------------------

    // SPRITES
    loaded = 0;
    sprites = [];
    sprites[0] = new Image();
    sprites[0].src = "img/paddle.png"
    sprites[1] = new Image();
    sprites[1].src = "img/ball.png"
    sprites[2] = new Image();
    sprites[2].src = "img/brick.png"

    for (var i = 0; i < sprites.length; i++) {
        sprites[i].onload = function () {
            loaded++;
            if (loaded == 3) {
                run();
            }
        }

    }


    //--------------------------

    // GAME Objects
    player = {
        sprite: sprites[0],
        x: width / 2 - 50,
        y: height - 32,
        width: 104,
        height: 32,
        update: function () {
            if (key[RIGHT]) {
                this.x += 4;
            }

            if (key[LEFT]) {
                this.x -= 4;
            }
            if (this.x <= 0) { this.x = 0; }
            if (this.x >= width - this.width) {
                this.x = width - this.width;
            }
        },
        render: function () {
            c.drawImage(this.sprite, this.x, this.y);
        }
    }

    ball = {
        sprite: sprites[1],
        x: player.x + 12,
        y: player.y - 16,
        dx: 2,
        dy: 2,
        width: 22,
        height: 22,
        holding: true,
        update: function () {
            if (this.holding) {
                this.x = player.x + 40;
                this.y = player.y - this.height - 4;
                if (key[CTRL]) {
                    this.holding = false;
                }
            }
            else {
                this.x += this.dx;
                this.y += this.dy;

                //COLLISION
                if ((this.y >= player.y - this.height) && (this.x >= player.x
                    && this.x <= player.x + player.width)
                    && this.y < player.y + player.height) {
                    this.dy = -this.dy;
                }
                if (this.y <= 0) {
                    this.dy = -this.dy;
                }
                if ((this.x <= 0) ||
                    (this.x >= width - this.width)) {
                    this.dx = -this.dx;
                }
                if (this.y > height + this.height) {
                    this.holding = true;
                    lives--;
                }
            }
        },

        render: function () {
            c.drawImage(this.sprite, this.x, this.y);
        }
    }



    brick = [];
    for (var i = 0; i < 8; i++) {
        brick[i] = new Array();
        for (var j = 0; j < 4; j++) {
            a = 4 * 8;
            brick[i][j] = {
                sprite: sprites[2],
                x: 64 + (i * 64),
                y: 42 + (j * 32),
                width: 42,
                height: 16,
                broken: false,
                update: function () {
                    if (!this.broken) {
                        if ((ball.y < this.y + this.height + ball.height)
                            && (ball.x > this.x - ball.width)
                            && (ball.x < this.x + this.width + ball.width)
                            && ball.y > this.y - ball.height) {
                            ball.dy = -ball.dy;
                            a--;
                            this.broken = true;
                            score += 10;
                        }
                    }

                    if (a == 0) {
                        scene = 2;
                    }
                },
                render: function () {
                    if (!this.broken) {
                        c.drawImage(this.sprite, this.x, this.y);
                    }
                }
            }
        }
    }

    //-------------------

    //


    gameScene = {
        update: function () {
            player.update();
            ball.update();
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 4; j++) {
                    brick[i][j].update();
                }
            }

            if (lives <= 0) {
                gameover = true;
            }

            if (gameover) {
                pause = true;

            }
        },
        render: function () {
            c.fillStyle = "gainsboro";
            c.fillRect(0, 0, width, height);
            c.fillStyle = "black";

            player.render();
            ball.render();
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 4; j++) {
                    brick[i][j].render();
                }
            }
            c.fillText("Score: " + score, 16, 16);
            c.fillText("Lives: " + lives, 16, 32);
            c.fillText("Level: 1", 16, 300);

            if (gameover) {
                c.fillText("Game Over", width / 2 - 40, 200);
                c.fillText("High Score: " + score, width / 2 - 50, 250);
            }


            if (pause && !gameover) {
                c.fillText("Game Pause", width / 2-50, 250);
            }
        }
    }

    mainMenuScene = {
        update: function () {
            if (key[ENTER]) {
                scene = 1;
            }
        },
        render: function () {
            c.fillStyle = "gainsboro";
            c.fillRect(0, 0, width, height);
            c.fillStyle = "black";
            c.font = 'Bold 30pt Jokerman';
            c.fillText("BreakOut!", width / 2 - 115, 100);
            c.font = '12pt Cambria';
            c.fillText("Press 'Enter' to play!", width / 2 - 70, 200);
            c.fillText("Instructions: ", width / 2 - 50, 225);
            c.fillText("Press 'Ctrl' to start moving the ball.", width / 2 - 100, 250);
        }
    }

    function run() {
        switch (scene) {
            case 0:
                gameover = false;
                lives = 3;
                score = 0;
                mainMenuScene.update();
                mainMenuScene.render();
                break;

            case 1:
                if (!pause) {
                    gameScene.update();
                }
                if (key[P] && !gameover) {
                    pause = true;
                }
                else if (key[P] && pause && !gameover) {
                    pause = false;
                }
                gameScene.render();
                break;
            case 2:
                c.fillText("You won!", width / 2-50, 200);
        }
        requestAnimationFrame(run);
    }

}
class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('rocket2', './assets/rocket2.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('dragon_purple', './assets/dragon_purple.png');
        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x4DC3FF).setOrigin(0, 0);
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);

        // add Rocket (p1)
        this.p1Rocket = new Rocket1(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        // add Rocket (p2)
        this.p2Rocket = new Rocket2(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket2').setOrigin(0.5, 0);

        // add Spaceships (x3)
        this.ship01 = new SpaceshipS(this, game.config.width + borderUISize*6, borderUISize*4, 'dragon_purple', 0, 50).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);

        // define keys
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);         // reset key

        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);         // p1 move
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);         // p1 move
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);         // p1 fire

        keyLEFT = this.input.keyboard.addKey(37);   // p2 move left arrow
        keyRIGHT = this.input.keyboard.addKey(39); // p2 move right arrow
        keyUP = this.input.keyboard.addKey(38);    // p2 fire

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 60
        });

        // initialize score
        this.p1Score = 0;
        this.p2Score = 0;

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#996239',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.p1ScoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);
        this.p2ScoreRight = this.add.text(game.config.width - borderPadding* 14, borderUISize + borderPadding*2, this.p2Score, scoreConfig);
        // GAME OVER flag
        this.gameOver = false;

        // default spped
        this.moveSpeed = game.settings.spaceshipspeed;
        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.currentTime = game.settings.gameTimer;
        this.clock = this.time.addEvent({
            delay: 1000,
            callback: decreaseTime,
            callbackScope: this,
            loop: true
        });

        this.timeRight = this.add.text(game.config.width - borderPadding* 30, borderUISize + borderPadding*2, game.settings.gameTimer/1000, scoreConfig);
        
        function decreaseTime(){
            this.currentTime -= 1000;
        }
        this.speedUp = game.settings.gameTimer - 30000;
    }

    update() {
        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        scoreConfig.fixedWidth = 0;

        if(this.currentTime > 0 && this.gameOver == false){
//            this.currentTime = this.clock.getRemainingSeconds();
            this.timeRight.text = Math.round(this.currentTime/1000);
            //this.timeRight.text = this.clock.getRemainingSeconds();
        }
        else{
            this.timeRight.text = "Time out";
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ??? to Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }

        // check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= 4;  // update tile sprite

        if(!this.gameOver) {
            this.p1Rocket.update();             // update p1
            this.p2Rocket.update();             // update p2
            this.ship01.update();               // update spaceship (x3)
            this.ship02.update();
            this.ship03.update();
        }

        // check collisions for p1
        if(this.checkCollision(this.p1Rocket,this.ship03)) {
            this.p1Rocket.reset();
            this.p1ShipExplode(this.ship03);
            this.p1ScoreLeft.text = this.p1Score; 
        }
        if (this.checkCollision(this.p1Rocket,this.ship02)) {
            this.p1Rocket.reset();
            this.p1ShipExplode(this.ship02);
            this.p1ScoreLeft.text = this.p1Score; 
        }
        if (this.checkCollision(this.p1Rocket,this.ship01)) {
            this.p1Rocket.reset();
            this.p1ShipExplode(this.ship01);
            this.p1ScoreLeft.text = this.p1Score; 
        }

        // check collisions for p2
        if(this.checkCollision(this.p2Rocket,this.ship03)) {
            this.p2Rocket.reset();
            this.p2ShipExplode(this.ship03);
            this.p2ScoreRight.text = this.p2Score; 
        }
        if (this.checkCollision(this.p2Rocket,this.ship02)) {
            this.p2Rocket.reset();
            this.p2ShipExplode(this.ship02);
            this.p2ScoreRight.text = this.p2Score; 
        }
        if (this.checkCollision(this.p2Rocket,this.ship01)) {
            this.p2Rocket.reset();
            this.p2ShipExplode(this.ship01);
            this.p2ScoreRight.text = this.p2Score; 
        }
    }

    checkCollision(rocket,ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } 
        else {
            return false;
        }
    }

    p1ShipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;                         
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });
        // score add and repaint
        this.p1Score += ship.points;
        this.p1ScoreLeft.text = this.p1Score; 
//        this.p2ScoreRight.text = this.p2Score;
        this.currentTime += 1000;
        this.sound.play('sfx_explosion');
      }

      p2ShipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;                         
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });
        // score add and repaint
        this.p2Score += ship.points;
//              this.p2ScoreRight.text = this.p2Score; 
//        this.p2ScoreRight.text = this.p2Score;
        this.currentTime += 1000;
        this.sound.play('sfx_explosion');
      }
}
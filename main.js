// Определяем класс сцены до конфигурации игры
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.goalSpeed = 100;
    this.ballSpeed = 500;
    this.previousScore = 0;
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('goal', 'assets/goal.png');
  }

  create() {
    // Добавляем ворота как динамический объект
    this.goal = this.physics.add.image(700, 300, 'goal'); // 700 = 800 - 100
    this.goal.setScale(1.5).refreshBody();
    this.goal.setImmovable(true); // Ворота не будут двигаться при столкновениях

    // Добавляем игрока
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Добавляем мяч
    this.ball = this.physics.add.sprite(this.player.x + 50, this.player.y, 'ball');
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1, 1);
    this.ball.setVelocity(0, 0);

    // Обработка столкновений мяча с воротами
    this.physics.add.overlap(this.ball, this.goal, this.scoreGoal, null, this);

    // Добавляем текст для счета
    this.scoreText = this.add.text(10, 10, 'Голов: 0', { fontSize: '24px', fill: '#ffffff' });

    // Добавляем кнопку для удара
    this.shootButton = this.add.text(325, 550, 'Удар', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      borderRadius: 5
    })
      .setInteractive()
      .on('pointerdown', () => {
        this.shootBall();
      });

    // Добавляем клавиатурное управление (опционально)
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Автоматическое движение ворот вверх и вниз
    if (this.goal.y < 100) {
      this.goal.setVelocityY(this.goalSpeed);
    } else if (this.goal.y > 500) { // 600 - 100
      this.goal.setVelocityY(-this.goalSpeed);
    }

    // Если ворота не движутся, начинаем движение
    if (this.goal.body.velocity.y === 0) {
      this.goal.setVelocityY(this.goalSpeed);
    }

    // Логика увеличения сложности
    if (this.score > 0 && this.score % 5 === 0 && this.score !== this.previousScore) {
      this.goalSpeed += 20;
      this.ballSpeed += 50;
      this.previousScore = this.score;
    }
  }

  shootBall() {
    // Устанавливаем начальную позицию мяча рядом с игроком
    this.ball.setPosition(this.player.x + 50, this.player.y);
    // Задаем скорость мяча в направлении ворот
    this.physics.moveToObject(this.ball, this.goal, this.ballSpeed);
    // Воспроизведение звука удара (опционально)
    // this.sound.play('shootSound');
  }

  scoreGoal(ball, goal) {
    // Увеличиваем счет
    this.score += 1;
    this.scoreText.setText('Голов: ' + this.score);

    // Перемещаем мяч обратно к игроку после забитого гола
    this.ball.setPosition(this.player.x + 50, this.player.y);
    this.ball.setVelocity(0, 0);

    // Воспроизведение звука гола (опционально)
    // this.sound.play('goalSound');
  }
}

// Основная конфигурация игры (должна быть после определения GameScene)
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Задание ширины в зависимости от экрана
  height: window.innerHeight, // Задание высоты в зависимости от экрана
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene] // Используем класс GameScene
};

// Создаём новый экземпляр игры
const game = new Phaser.Game(config);

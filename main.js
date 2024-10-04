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
    // this.scoreText = this.add.text(10, 10, 'Голов: 0', { fontSize: '24px', fill: '#ffffff' });

    // Добавляем кнопку для удара
    this.shootButton = this.add.text(window.innerWidth / 2, window.innerHeight - 80, 'Удар', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      borderRadius: 5
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.shootBall();
      });

    // Добавляем клавиатурное управление (опционально)
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const cameraHeight = this.cameras.main.displayHeight;

    // Ограничение движения ворот с учетом текущей высоты камеры
    if (this.goal.y < 50) {
      this.goal.setVelocityY(this.goalSpeed);
    } else if (this.goal.y > cameraHeight - 100) {
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
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock("landscape").catch(function (error) {
    console.error("Ошибка при блокировке ориентации: ", error);
  });
}

// Основная конфигурация игры (должна быть после определения GameScene)
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE, // Автоматическое изменение размеров в зависимости от экрана
    autoCenter: Phaser.Scale.CENTER_BOTH // Автоматическое центрирование игры на экране
  }
};

window.addEventListener('resize', () => {
  // Изменяем размеры камеры и игры в соответствии с новыми размерами экрана
  game.scale.resize(window.innerWidth, window.innerHeight);

  // Получаем текущую сцену игры
  let currentScene = game.scene.getScene('GameScene');

  if (currentScene) {
    let cameraHeight = currentScene.cameras.main.displayHeight;
    let cameraWidth = currentScene.cameras.main.displayWidth;

    // Обновляем размеры и позиции ворот
    if (currentScene.goal) {
      currentScene.goal.setPosition(cameraWidth - 100, Math.min(currentScene.goal.y, cameraHeight - 100));
    }

    // Обновляем позицию игрока, чтобы он не выходил за границы
    if (currentScene.player) {
      currentScene.player.setPosition(100, Math.min(currentScene.player.y, cameraHeight - 50));
    }

    // Обновляем позицию мяча рядом с игроком
    if (currentScene.ball) {
      currentScene.ball.setPosition(currentScene.player.x + 50, currentScene.player.y);
    }

    // Обновляем позицию кнопки "Удар"
    if (currentScene.shootButton) {
      currentScene.shootButton.setPosition(cameraWidth / 2, cameraHeight - 80);
    }

    // Обновляем позицию текста счета
    if (currentScene.scoreText) {
      currentScene.scoreText.setPosition(10, 10);
    }
  }
});

// Создаём новый экземпляр игры
const game = new Phaser.Game(config);

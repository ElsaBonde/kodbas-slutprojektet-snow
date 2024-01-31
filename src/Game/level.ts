class Level {
  private entities: Entity[]; // Level är experten på entiteter
  private baby: Baby;
  private ghost: Ghost;
  public score: number;
  public time: Time;
  private walls: Wall[];
  private music: {
    beerSound: p5.SoundFile;
    formulaSound: p5.SoundFile;
    clockSound: p5.SoundFile;
    bgSound: p5.SoundFile;
    ghostSound: p5.SoundFile;
  };
  private countDownToStart: number;
  public hasBabyReachedDoor: boolean;
  private hasBabyOpenedDoor: boolean = false;
  private background: Background;

  constructor(
    entities: Entity[],
    baby: Baby,
    ghost: Ghost,
    music: {
      beerSound: p5.SoundFile;
      formulaSound: p5.SoundFile;
      clockSound: p5.SoundFile;
      bgSound: p5.SoundFile;
      ghostSound: p5.SoundFile;
    },
    previousScore: number = 0,
    levelImage: p5.Image
  ) {
    this.entities = entities;
    this.background = new Background(levelImage);
    this.baby = baby;
    this.ghost = ghost;
    this.time = new Time(60);
    this.music = music;
    this.countDownToStart = 3000;
    this.score = previousScore;

    //walls är en array som endast innehåller väggarna i aktiv level, detta hämtas med hjälp av filter som i sin tur hämtar alla väggar från entities
    this.walls = entities.filter((entity) => entity instanceof Wall) as Wall[];

    this.hasBabyReachedDoor = false;
  }

  isGameOver(): boolean {
    return this.time.isGameOver;
  }

  // Returnerar poängen från den nuvarande nivån
  public getScore(): number {
    return this.score;
  }

  //Kollar av mellan bebisen och andra entiter
  private checkCollision(baby: Baby, entities: Entity[]): void {
    for (const entity of entities) {
      if (
        baby.x < entity.x + entity.size &&
        baby.x + baby.size > entity.x &&
        baby.y < entity.y + entity.size &&
        baby.y + baby.size > entity.y
      ) {
        this.handleCollision(baby, entity);
      }
      if (
        baby.x < this.ghost.x + this.ghost.size &&
        baby.x + baby.size > this.ghost.x &&
        baby.y < this.ghost.y + this.ghost.size &&
        baby.y + baby.size > this.ghost.y
      ) {
        this.handleCollision(baby, this.ghost);
      }
    }
  }
  /***
   * Tar hand om kollisionen med olika entiteter
   */
  private handleCollision(baby: Baby, entity: Entity): void {
    //ÖL
    if (entity instanceof Beer) {
      baby.goSlow();
      entity.remove();
      baby.beerCount += 1;
      if (baby.beerCount > 1) {
        baby.spin();
      }
      this.music.beerSound.play();
    }

    //VÄLLING
    if (entity instanceof Formula) {
      entity.remove();
      this.score += 1;
      this.music.formulaSound.play();
    }

    //KLOCKA
    if (entity instanceof Clock) {
      this.time.freezeTime();
      entity.remove();
      this.music.clockSound.play();
    }

    //DÖRR
    if (entity instanceof Door) {
      const door = entity as Door;
      door.openDoor();
      game.nextLevel();
    }

    //SPÖKE
    if (entity instanceof Ghost) {
      if (!baby.effectedByGhost) {
        this.music.ghostSound.play();
        baby.effectedByGhost = true;
        this.score -= 1;

        setTimeout(() => {
          baby.effectedByGhost = false;
        }, 2000);
      }
    }
  }

  /***
   * Ritar ut och placerar poängräkning, samt koordinatern för bild
   */
  drawScore() {
    image(formulaImg, 36, 4, 30, 30);

    push();
    textSize(22);
    textFont("Orbitron");
    fill("#64E12A");
    text(`: ${this.score}`, 71, 29);
    pop();
  }

  update(): void {
    if (this.countDownToStart > 0) {
      this.countDownToStart -= deltaTime;
      return;
    }

    for (let entity of this.entities) {
      if (entity instanceof Ghost) {
        entity.update(this.baby);
      }
    }
    this.ghost.update(this.baby);
    this.baby.update(this.walls);
    this.checkCollision(this.baby, this.entities);

    if (this.hasBabyOpenedDoor) {
      this.time.setTimeToZero();
    } else {
      this.time.update();
    }

    this.background.update();
  }

  private drawCountDown() {
    push();
    noStroke();
    fill(0, 0, 0, 95);
    circle(500, 300, 500);
    pop();

    push();
    textSize(250);
    textFont("Orbitron");
    fill("#64E12A");
    textAlign(CENTER);
    text(Math.ceil(this.countDownToStart / 1000), width / 2, 375);
    pop();
  }

  drawCurrentLevelNumber() {
    push();
    textSize(22);
    textFont("Orbitron");
    fill("#64E12A");
    textAlign(CENTER);
    text(`Level: ${game.currentLevelNumber}`, width / 2, 29);
    pop();
  }

  draw() {
    push();
    this.background.draw();

    for (let entity of this.entities) {
      entity.draw();
    }

    if (!this.music.bgSound.isPlaying()) {
      this.music.bgSound.play();
    }

    this.ghost.draw();
    this.baby.draw();

    pop();
    this.drawScore();
    this.drawCurrentLevelNumber();
    this.time.draw();

    if (this.countDownToStart > 0) {
      this.drawCountDown();
    }
  }
}

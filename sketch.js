
let player;
let enemies = [];
let bullets = [];
let obstacles = [];
let explosions = [];
let decorations = [];

let worldW = 1800;
let worldH = 1200;
let cameraX = 0;
let cameraY = 0;

let score = 0;
let wave = 1;
let maxWaves = 3;
let gameOver = false;
let victory = false;

let lastShot = 0;
let canvasElement;

let joystick = {
  active: false,
  dx: 0,
  dy: 0,
  baseX: 100,
  baseY: 0,
  knobX: 100,
  knobY: 0,
  radius: 55
};

let fireButton = {
  x: 0,
  y: 0,
  radius: 42
};

function setup() {
  canvasElement = createCanvas(windowWidth, windowHeight);
  canvasElement.elt.setAttribute("tabindex", "0");
  canvasElement.elt.style.outline = "none";

  angleMode(RADIANS);
  textFont("monospace");

  createWorld();
  startGame();
  updateTouchControls();
}

function createWorld() {
  obstacles = [];
  decorations = [];

  // Obstacles répartis dans le monde
  for (let i = 0; i < 45; i++) {
    let w = random(45, 120);
    let h = random(45, 110);
    let x = random(100, worldW - w - 100);
    let y = random(100, worldH - h - 100);

    if (dist(x, y, worldW / 2, worldH / 2) > 180) {
      obstacles.push({ x, y, w, h });
    }
  }

  // Végétation et détails du terrain
  for (let i = 0; i < 350; i++) {
    decorations.push({
      x: random(worldW),
      y: random(worldH),
      size: random(3, 12),
      shade: random(45, 95)
    });
  }
}

function startGame() {
  player = {
    x: worldW / 2,
    y: worldH / 2,
    angle: 0,
    turretAngle: 0,
    speed: 2.7,
    health: 100,
    radius: 22,
    cooldown: 0
  };

  enemies = [];
  bullets = [];
  explosions = [];

  score = 0;
  wave = 1;
  gameOver = false;
  victory = false;

  spawnWave();
}

function spawnWave() {
  let count = 3 + wave * 2;

  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;

    do {
      let side = floor(random(4));

      if (side === 0) {
        x = random(worldW);
        y = 50;
      } else if (side === 1) {
        x = worldW - 50;
        y = random(worldH);
      } else if (side === 2) {
        x = random(worldW);
        y = worldH - 50;
      } else {
        x = 50;
        y = random(worldH);
      }

      attempts++;
    } while (
      dist(x, y, player.x, player.y) < 350 &&
      attempts < 20
    );

    enemies.push({
      x,
      y,
      angle: random(TWO_PI),
      turretAngle: 0,
      speed: random(0.8, 1.25) + wave * 0.12,
      health: 2 + floor(wave / 2),
      radius: 21,
      cooldown: random(30, 100),
      turnDirection: random([-1, 1])
    });
  }
}

function draw() {
  background(65, 78, 48);

  if (!gameOver && !victory) {
    updatePlayer();
    updateEnemies();
    updateBullets();
    updateExplosions();
    checkWaveProgress();
  } else {
    updateExplosions();
  }

  updateCamera();

  push();
  translate(-cameraX, -cameraY);

  drawWorld();
  drawObstacles();

  for (let enemy of enemies) {
    drawTank(enemy, color(135, 76, 48), color(76, 55, 39));
  }

  drawTank(player, color(117, 145, 75), color(65, 82, 46));

  for (let bullet of bullets) {
    drawBullet(bullet);
  }

  for (let explosion of explosions) {
    drawExplosion(explosion);
  }

  pop();

  drawHUD();
  drawTouchControls();

  if (gameOver) {
    drawEndScreen("MISSION ÉCHOUÉE", "Appuie sur RECOMMENCER");
  }

  if (victory) {
    drawEndScreen("VICTOIRE !", "Toutes les vagues sont terminées");
  }
}

function drawWorld() {
  noStroke();
  fill(74, 88, 52);
  rect(0, 0, worldW, worldH);

  // Zones irrégulières de camouflage
  for (let i = 0; i < decorations.length; i++) {
    let d = decorations[i];
    fill(35, d.shade, 37, 100);
    ellipse(d.x, d.y, d.size * 2, d.size);
  }

  // Limites du champ de bataille
  noFill();
  stroke(37, 46, 29);
  strokeWeight(14);
  rect(0, 0, worldW, worldH);
  strokeWeight(1);

  // Repères discrets au sol
  stroke(110, 115, 72, 65);
  for (let x = 100; x < worldW; x += 100) {
    line(x, 0, x, worldH);
  }
  for (let y = 100; y < worldH; y += 100) {
    line(0, y, worldW, y);
  }
  noStroke();
}

function drawObstacles() {
  for (let o of obstacles) {
    // Ombre
    fill(25, 30, 22, 100);
    rect(o.x + 6, o.y + 7, o.w, o.h, 5);

    // Obstacles
    fill(84, 82, 61);
    rect(o.x, o.y, o.w, o.h, 5);

    fill(105, 103, 77);
    rect(o.x + 5, o.y + 5, o.w - 10, 8, 3);

    stroke(47, 49, 35);
    noFill();
    rect(o.x, o.y, o.w, o.h, 5);
    noStroke();
  }
}

function drawTank(tank, bodyColor, turretColor) {
  push();
  translate(tank.x, tank.y);

  // Chenilles
  rotate(tank.angle);
  rectMode(CENTER);

  noStroke();
  fill(35, 39, 29);
  rect(-3, -16, 43, 10, 3);
  rect(-3, 16, 43, 10, 3);

  // Roues
  fill(77, 78, 57);
  for (let i = -18; i <= 18; i += 9) {
    ellipse(i, -16, 6, 6);
    ellipse(i, 16, 6, 6);
  }

  // Châssis
  fill(bodyColor);
  rect(0, 0, 39, 29, 5);

  fill(165, 158, 102, 100);
  rect(-4, -6, 19, 5, 2);

  // Camouflage
  fill(48, 72, 42, 180);
  ellipse(9, 6, 12, 7);
  ellipse(-10, -8, 8, 6);

  // Tourelle et canon
  rotate(-tank.angle + tank.turretAngle);
  fill(40, 48, 31);
  rect(12, 0, 31, 7, 2);

  fill(turretColor);
  ellipse(0, 0, 23, 23);

  fill(bodyColor);
  ellipse(0, 0, 15, 15);

  // Petit repère avant
  fill(190, 180, 115);
  rect(8, 0, 5, 5, 1);

  rectMode(CORNER);
  pop();
}

function drawBullet(b) {
  push();
  translate(b.x, b.y);
  rotate(b.angle);

  noStroke();
  fill(255, 215, 110);
  ellipse(0, 0, 10, 5);

  fill(255, 245, 185);
  ellipse(0, 0, 5, 3);
  pop();
}

function drawExplosion(e) {
  noStroke();

  let alpha = map(e.life, 0, e.maxLife, 0, 220);
  let size = e.size * (1 - e.life / e.maxLife) + 5;

  fill(255, 180, 55, alpha);
  ellipse(e.x, e.y, size, size);

  fill(220, 75, 35, alpha * 0.8);
  ellipse(e.x, e.y, size * 0.6, size * 0.6);
}

function drawHUD() {
  push();
  resetMatrix();

  // Fond supérieur
  noStroke();
  fill(20, 27, 20, 225);
  rect(0, 0, width, 76);

  fill(220, 224, 190);
  textAlign(LEFT, CENTER);
  textSize(14);
  text("BLINDÉS TACTIQUES", 15, 18);

  textSize(12);
  text("SCORE : " + score, 15, 43);
  text("VAGUE : " + wave + "/" + maxWaves, 15, 61);

  // Barre de santé
  let barX = width / 2 - 75;
  let barY = 25;

  fill(55, 58, 45);
  rect(barX, barY, 150, 16, 3);

  fill(player.health > 30 ? color(95, 170, 70) : color(205, 65, 45));
  rect(barX, barY, 150 * constrain(player.health / 100, 0, 1), 16, 3);

  fill(235, 235, 210);
  textAlign(CENTER, CENTER);
  text("BLINDAGE " + max(0, floor(player.health)) + "%", width / 2, 12);

  // Bouton recommencer
  let bw = 115;
  let bh = 32;
  let bx = width - bw - 12;
  let by = 22;

  fill(68, 83, 52);
  stroke(153, 166, 111);
  rect(bx, by, bw, bh, 5);
  noStroke();

  fill(240, 240, 210);
  textSize(11);
  text("RECOMMENCER", bx + bw / 2, by + bh / 2);

  if (width > 650) {
    textAlign(CENTER, BOTTOM);
    fill(235, 235, 205, 210);
    textSize(11);
    text("ZQSD / FLÈCHES : DÉPLACER     ESPACE : TIRER",
      width / 2, height - 12);
  }

  pop();
}

function drawTouchControls() {
  push();
  resetMatrix();

  // Joystick virtuel
  let baseY = height - 100;
  joystick.baseX = 95;
  joystick.baseY = baseY;

  noStroke();
  fill(20, 25, 18, 110);
  ellipse(joystick.baseX, baseY, 112, 112);

  stroke(200, 210, 165, 130);
  strokeWeight(2);
  noFill();
  ellipse(joystick.baseX, baseY, 90, 90);

  noStroke();
  fill(150, 165, 115, 180);
  ellipse(joystick.knobX, joystick.knobY, 43, 43);

  // Bouton de tir
  fireButton.x = width - 82;
  fireButton.y = height - 100;

  fill(115, 48, 35, 200);
  stroke(235, 160, 105, 200);
  strokeWeight(2);
  ellipse(fireButton.x, fireButton.y,
    fireButton.radius * 2, fireButton.radius * 2);

  noStroke();
  fill(255, 230, 190);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("TIR", fireButton.x, fireButton.y);

  pop();
}

function drawEndScreen(titleText, subtitleText) {
  push();
  resetMatrix();

  fill(0, 0, 0, 175);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(230, 225, 190);
  textSize(min(34, width * 0.09));
  text(titleText, width / 2, height / 2 - 30);

  textSize(14);
  text(subtitleText, width / 2, height / 2 + 15);

  fill(180, 195, 130);
  textSize(12);
  text("Clique sur RECOMMENCER pour rejouer",
    width / 2, height / 2 + 45);

  pop();
}

function updatePlayer() {
  if (gameOver || victory) return;

  let dx = 0;
  let dy = 0;

  // Clavier AZERTY : ZQSD
  if (keyIsDown(90) || keyIsDown(UP_ARROW)) dy--;
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) dy++;
  if (keyIsDown(81) || keyIsDown(LEFT_ARROW)) dx--;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) dx++;

  // Compatibilité avec certains claviers QWERTY
  if (keyIsDown(87) && !keyIsDown(90)) dy--;

  // Joystick tactile
  if (joystick.active) {
    dx = joystick.dx;
    dy = joystick.dy;
  }

  // Normaliser la direction pour éviter d'aller plus vite en diagonale
  if (dx !== 0 || dy !== 0) {
    let magnitude = sqrt(dx * dx + dy * dy);
    dx /= max(1, magnitude);
    dy /= max(1, magnitude);

    let nextX = player.x + dx * player.speed;
    let nextY = player.y + dy * player.speed;

    if (!collidesWithObstacle(nextX, player.y, player.radius)) {
      player.x = constrain(nextX, player.radius, worldW - player.radius);
    }

    if (!collidesWithObstacle(player.x, nextY, player.radius)) {
      player.y = constrain(nextY, player.radius, worldH - player.radius);
    }

    player.angle = atan2(dy, dx);
  }

  // Orienter le canon vers la souris ou vers l'ennemi le plus proche
  let target = findNearestEnemy();

  if (target && (isTouchDevice() || !mouseIsPressed)) {
    player.turretAngle = atan2(
      target.y - player.y,
      target.x - player.x
    );
  } else {
    let worldMouseX = mouseX + cameraX;
    let worldMouseY = mouseY + cameraY;

    player.turretAngle = atan2(
      worldMouseY - player.y,
      worldMouseX - player.x
    );
  }

  // Tir au clavier, à la souris ou avec le bouton tactile
  let screenFire = isFireButtonPressed();

  if (keyIsDown(32) || screenFire ||
      (mouseIsPressed && !joystick.active && !isRestartButtonPressed())) {
    shootPlayer();
  }
}

function updateEnemies() {
  for (let enemy of enemies) {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distanceToPlayer = sqrt(dx * dx + dy * dy);

    enemy.turretAngle = atan2(dy, dx);

    // Les ennemis avancent vers le joueur
    if (distanceToPlayer > 150) {
      enemy.angle = atan2(dy, dx);

      let nextX = enemy.x + cos(enemy.angle) * enemy.speed;
      let nextY = enemy.y + sin(enemy.angle) * enemy.speed;

      if (!collidesWithObstacle(nextX, enemy.y, enemy.radius)) {
        enemy.x = nextX;
      } else {
        enemy.angle += enemy.turnDirection * 0.8;
      }

      if (!collidesWithObstacle(enemy.x, nextY, enemy.radius)) {
        enemy.y = nextY;
      } else {
        enemy.angle += enemy.turnDirection * 0.8;
      }
    } else {
      enemy.angle = atan2(dy, dx);
    }

    enemy.cooldown--;

    if (enemy.cooldown <= 0 && distanceToPlayer < 520) {
      shootEnemy(enemy);
      enemy.cooldown = random(65, 110) / (1 + wave * 0.15);
    }
  }

  // Collision entre chars ennemis et joueur
  for (let enemy of enemies) {
    if (dist(enemy.x, enemy.y, player.x, player.y) <
        enemy.radius + player.radius - 5) {
      player.health -= 0.12;
    }
  }

  if (player.health <= 0) {
    player.health = 0;
    gameOver = true;
    createExplosion(player.x, player.y, 80);
  }
}

function shootPlayer() {
  if (player.cooldown > 0) {
    player.cooldown--;
    return;
  }

  player.cooldown = 16;

  let angle = player.turretAngle;
  let x = player.x + cos(angle) * 27;
  let y = player.y + sin(angle) * 27;

  bullets.push({
    x,
    y,
    vx: cos(angle) * 8,
    vy: sin(angle) * 8,
    angle,
    owner: "player",
    life: 100,
    damage: 1
  });
}

function shootEnemy(enemy) {
  let angle = atan2(player.y - enemy.y, player.x - enemy.x);
  let x = enemy.x + cos(angle) * 25;
  let y = enemy.y + sin(angle) * 25;

  bullets.push({
    x,
    y,
    vx: cos(angle) * 4.5,
    vy: sin(angle) * 4.5,
    angle,
    owner: "enemy",
    life: 120,
    damage: 8
  });
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];

    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    let removeBullet = false;

    if (b.life <= 0 ||
        b.x < 0 || b.x > worldW ||
        b.y < 0 || b.y > worldH) {
      removeBullet = true;
    }

    for (let o of obstacles) {
      if (b.x > o.x && b.x < o.x + o.w &&
          b.y > o.y && b.y < o.y + o.h) {
        createExplosion(b.x, b.y, 12);
        removeBullet = true;
        break;
      }
    }

    if (!removeBullet && b.owner === "player") {
      for (let j = enemies.length - 1; j >= 0; j--) {
        let enemy = enemies[j];

        if (dist(b.x, b.y, enemy.x, enemy.y) <
            enemy.radius + 3) {
          enemy.health -= b.damage;
          createExplosion(b.x, b.y, 15);
          removeBullet = true;

          if (enemy.health <= 0) {
            createExplosion(enemy.x, enemy.y, 45);
            enemies.splice(j, 1);
            score += 100;
          }
          break;
        }
      }
    } else if (!removeBullet && b.owner === "enemy") {
      if (dist(b.x, b.y, player.x, player.y) <
          player.radius + 3) {
        player.health -= b.damage;
        createExplosion(b.x, b.y, 18);
        removeBullet = true;

        if (player.health <= 0) {
          player.health = 0;
          gameOver = true;
          createExplosion(player.x, player.y, 80);
        }
      }
    }

    if (removeBullet) {
      bullets.splice(i, 1);
    }
  }
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].life--;

    if (explosions[i].life <= 0) {
      explosions.splice(i, 1);
    }
  }
}

function createExplosion(x, y, size) {
  explosions.push({
    x,
    y,
    size,
    life: 18,
    maxLife: 18
  });
}

function checkWaveProgress() {
  if (enemies.length === 0) {
    if (wave < maxWaves) {
      wave++;
      spawnWave();
    } else {
      victory = true;
    }
  }
}

function collidesWithObstacle(x, y, radius) {
  for (let o of obstacles) {
    let closestX = constrain(x, o.x, o.x + o.w);
    let closestY = constrain(y, o.y, o.y + o.h);

    let dx = x - closestX;
    let dy = y - closestY;

    if (dx * dx + dy * dy < radius * radius) {
      return true;
    }
  }

  return false;
}

function findNearestEnemy() {
  let nearest = null;
  let nearestDistance = Infinity;

  for (let enemy of enemies) {
    let d = dist(player.x, player.y, enemy.x, enemy.y);

    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = enemy;
    }
  }

  return nearest;
}

function updateCamera() {
  cameraX = constrain(
    player.x - width / 2,
    0,
    max(0, worldW - width)
  );

  cameraY = constrain(
    player.y - height / 2,
    0,
    max(0, worldH - height)
  );
}

function updateTouchControls() {
  joystick.baseY = height - 100;
  joystick.knobX = joystick.baseX;
  joystick.knobY = joystick.baseY;

  fireButton.x = width - 82;
  fireButton.y = height - 100;
}

function isTouchDevice() {
  return ("ontouchstart" in window) || width < 700;
}

function isFireButtonPressed() {
  if (!mouseIsPressed) return false;

  return dist(
    mouseX,
    mouseY,
    fireButton.x,
    fireButton.y
  ) < fireButton.radius + 10;
}

function isRestartButtonPressed() {
  return mouseX > width - 135 &&
         mouseX < width - 10 &&
         mouseY > 15 &&
         mouseY < 65;
}

function mousePressed() {
  if (canvasElement && canvasElement.elt) {
    canvasElement.elt.focus();
  }

  // Bouton recommencer
  if (isRestartButtonPressed()) {
    startGame();
    return false;
  }

  // Joystick tactile : zone gauche en bas de l'écran
  if (mouseY > height - 190 && mouseX < width * 0.42) {
    joystick.active = true;
    updateJoystick(mouseX, mouseY);
    return false;
  }

  // Le bouton de tir est géré pendant l'appui
  return false;
}

function mouseDragged() {
  if (joystick.active) {
    updateJoystick(mouseX, mouseY);
    return false;
  }
}

function mouseReleased() {
  joystick.active = false;
  joystick.dx = 0;
  joystick.dy = 0;
  joystick.knobX = joystick.baseX;
  joystick.knobY = joystick.baseY;
  return false;
}

function updateJoystick(x, y) {
  let dx = x - joystick.baseX;
  let dy = y - joystick.baseY;

  let magnitude = sqrt(dx * dx + dy * dy);
  let maxDistance = joystick.radius;

  if (magnitude > maxDistance) {
    dx = dx / magnitude * maxDistance;
    dy = dy / magnitude * maxDistance;
  }

  joystick.knobX = joystick.baseX + dx;
  joystick.knobY = joystick.baseY + dy;

  joystick.dx = dx / maxDistance;
  joystick.dy = dy / maxDistance;

  if (abs(joystick.dx) < 0.15) joystick.dx = 0;
  if (abs(joystick.dy) < 0.15) joystick.dy = 0;
}

function keyPressed() {
  if (canvasElement && canvasElement.elt) {
    canvasElement.elt.focus();
  }

  if (key === "r" || key === "R") {
    startGame();
  }

  // Empêche la page de défiler avec les flèches et l'espace
  if (
    keyCode === UP_ARROW ||
    keyCode === DOWN_ARROW ||
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW ||
    keyCode === 32
  ) {
    return false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateTouchControls();
}


let flies = [];
let spider;

let eaten = 0;
let totalSpawned = 0;

let clearButton;
let lastSpawnTime = 0;
let spawnInterval = 650;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");

  spider = {
    x: width / 2,
    y: height / 2,
    size: 34
  };

  clearButton = createButton("Clear / Restart");
  clearButton.position(18, 18);
  clearButton.style("padding", "9px 16px");
  clearButton.style("font-size", "15px");
  clearButton.style("font-weight", "bold");
  clearButton.style("color", "#ffffff");
  clearButton.style("background", "#25283d");
  clearButton.style("border", "1px solid #69708d");
  clearButton.style("border-radius", "9px");
  clearButton.style("touch-action", "manipulation");
  clearButton.mousePressed(restartGame);

  lastSpawnTime = millis();
}

function draw() {
  background(8, 11, 24);

  drawWeb();

  // Spawn flies at random intervals
  if (millis() - lastSpawnTime >= spawnInterval) {
    spawnFly();
    lastSpawnTime = millis();
    spawnInterval = random(450, 850);
  }

  // Move spider smoothly toward the pointer
  spider.x = lerp(
    spider.x,
    constrain(pointerX(), 0, width),
    0.16
  );

  spider.y = lerp(
    spider.y,
    constrain(pointerY(), 0, height),
    0.16
  );

  // Update and draw flies
  for (let i = flies.length - 1; i >= 0; i--) {
    let f = flies[i];

    // Flies disappear after 1.5 seconds
    if (millis() - f.bornAt >= 1500) {
      flies.splice(i, 1);
      continue;
    }

    drawFly(f);

    // Catch a fly when the spider touches it
    let catchDistance = dist(
      spider.x, spider.y,
      f.x, f.y
    );

    if (catchDistance < 24 + f.size * 0.45) {
      flies.splice(i, 1);
      eaten++;
    }
  }

  drawSpider(spider.x, spider.y);
  drawHUD();
}

// Mouse and touchscreen pointer positions
function pointerX() {
  if (touches.length > 0) {
    return touches[0].x;
  }
  return mouseX;
}

function pointerY() {
  if (touches.length > 0) {
    return touches[0].y;
  }
  return mouseY;
}

// Spawn a colorful fly
function spawnFly() {
  let f = {
    x: random(30, max(31, width - 30)),
    y: random(145, max(146, height - 30)),
    size: random(12, 19),
    color: color(
      random(100, 256),
      random(100, 256),
      random(130, 256)
    ),
    bornAt: millis(),
    wingPhase: random(TWO_PI)
  };

  flies.push(f);
  totalSpawned++;
}

// Draw a fluttering fly
function drawFly(f) {
  push();
  translate(f.x, f.y);

  let wing = sin(
    millis() * 0.025 + f.wingPhase
  ) * 4;

  noStroke();

  // Translucent wings
  fill(
    red(f.color),
    green(f.color),
    blue(f.color),
    100
  );

  ellipse(
    -5, -5 + wing,
    f.size * 0.65, f.size * 0.42
  );

  ellipse(
    5, -5 - wing,
    f.size * 0.65, f.size * 0.42
  );

  // Body
  fill(f.color);
  circle(0, 0, f.size);

  // Highlight
  fill(255, 235);
  circle(
    -f.size * 0.16,
    -f.size * 0.16,
    f.size * 0.25
  );

  // Motion marks
  stroke(
    red(f.color),
    green(f.color),
    blue(f.color),
    150
  );
  strokeWeight(1.5);

  line(-f.size, 0, -f.size - 4, -3);
  line(f.size, 0, f.size + 4, 3);

  pop();
}

// Draw an animated giant spider
function drawSpider(x, y) {
  push();

  let t = millis() * 0.008;

  // Body bobs up and down
  let bob = sin(t * 2) * 2.5;

  // Slight body tilt for a living effect
  let tilt = sin(t * 1.3) * 0.06;

  translate(x, y + bob);
  rotate(tilt);

  // Eight animated legs
  stroke(4, 5, 12);
  strokeWeight(5);
  strokeCap(ROUND);
  noFill();

  for (let side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      let phase = t * 2.2 + i * 1.5 + side;
      let swing = sin(phase) * 7;
      let lift = cos(phase) * 4;

      let startX = side * 7;
      let startY = (i - 1.5) * 5;

      let bendX = side * (19 + swing);
      let bendY =
        startY + (i - 1.5) * 7 + lift;

      let endX = side * (31 + swing * 1.3);
      let endY =
        startY + (i - 1.5) * 15 - lift;

      // Upper leg
      line(startX, startY, bendX, bendY);

      // Lower leg
      line(bendX, bendY, endX, endY);
    }
  }

  // Spider abdomen
  noStroke();
  fill(28, 32, 48);
  ellipse(0, 5, 33, 38);

  // Head
  fill(45, 50, 72);
  circle(0, -15, 23);

  // Red abdomen marking
  fill(245, 55, 85);
  ellipse(0, 7, 8, 18);
  ellipse(-3, 3, 4, 7);
  ellipse(3, 10, 4, 7);

  // Glowing eyes
  fill(255, 55, 75);
  circle(-5, -17, 4.5);
  circle(5, -17, 4.5);

  fill(255, 190, 195);
  circle(-5.5, -18, 1.5);
  circle(4.5, -18, 1.5);

  // Tiny fangs
  stroke(210, 215, 230);
  strokeWeight(2);
  line(-4, -7, -6, -3);
  line(4, -7, 6, -3);

  pop();
}

// Draw a giant spider web
function drawWeb() {
  push();
  translate(width / 2, height / 2);

  let maxRadius = sqrt(
    width * width + height * height
  );

  // Radial silk threads
  stroke(120, 155, 190, 55);
  strokeWeight(1);
  noFill();

  for (let i = 0; i < 18; i++) {
    let angle = TWO_PI * i / 18;

    line(
      0, 0,
      cos(angle) * maxRadius,
      sin(angle) * maxRadius
    );
  }

  // Concentric web rings
  for (let r = 35; r < maxRadius; r += 32) {
    beginShape();

    for (let i = 0; i <= 180; i++) {
      let angle = TWO_PI * i / 180;

      let wobble =
        5 * sin(angle * 9 + r * 0.03);

      let x = cos(angle) * (r + wobble);
      let y = sin(angle) * (r + wobble);

      vertex(x, y);
    }

    endShape(CLOSE);
  }

  // Brighter silk threads
  stroke(170, 205, 235, 75);
  strokeWeight(1.4);

  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI * i / 6 + 0.12;

    line(
      0, 0,
      cos(angle) * maxRadius,
      sin(angle) * maxRadius
    );
  }

  pop();
}

// Display score and instructions
function drawHUD() {
  noStroke();

  fill(18, 22, 40, 235);
  rect(12, 62, 230, 68, 12);

  fill(245);
  textAlign(LEFT, TOP);
  textSize(15);

  text("Flies eaten: " + eaten, 25, 72);
  text("Total appeared: " + totalSpawned, 25, 100);

  fill(180, 195, 220);
  textAlign(CENTER, BOTTOM);
  textSize(12);

  text(
    "Move your mouse or finger to catch flies!",
    width / 2,
    height - 14
  );
}

// Reset game and counters
function restartGame() {
  flies = [];
  eaten = 0;
  totalSpawned = 0;

  lastSpawnTime = millis();
  spawnInterval = 650;

  spider.x = width / 2;
  spider.y = height / 2;
}

// Prevent touchscreen scrolling while playing
function touchStarted() {
  return false;
}

function touchMoved() {
  return false;
}

// Resize for different screens
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  spider.x = constrain(spider.x, 0, width);
  spider.y = constrain(spider.y, 0, height);
}

let fireworks, trails, sparkles, title, disclaimer; // objects
let fireworks_number, margin, starting_fireworks, show_fps, show_version, version; // parameters
let explosion_sound; // sound
let audio_started; // audio context started
let font;

function preload() {
  soundFormats("mp3");
  explosion_sound = loadSound('assets/explosion');
  font = loadFont('assets/FFFFORWA.ttf');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch');
  colorMode(HSB, 100);

  fireworks = [];
  trails = [];
  sparkles = [];
  title = new Title(font);
  disclaimer = new Disclaimer(font);
  audio_started = false;

  // SKETCH PARAMETERS
  if (displayWidth > 600) {
    fireworks_number = 20;
    margin = 0.2;
  } else {
    fireworks_number = 7;
    margin = 0.3;
  }

  starting_fireworks = 2;
  show_version = true;
  show_fps = true;
  version = "1.0.1";
}

function draw() {
  background(5);

  // show fps
  if (show_fps) {
    let fps = `FPS: ${Math.floor(frameRate())}`;
    push();
    translate(20, 40);
    rectMode(CENTER);
    textFont(font);
    noStroke();
    fill(250, 50);
    text(fps, 0, 0);
    pop();
  }

  // show version
  if (show_version) {
    push();
    translate(width - 100, 40);
    rectMode(CENTER);
    textFont(font);
    noStroke();
    fill(250, 50);
    text(`Version: ${version}`, 0, 0);
    pop();
  }

  // show title
  if (title.alive) {
    title.show();
    title.update();
  }

  // show disclaimer on bottom
  if (disclaimer.alive) {
    disclaimer.show();
  }

  // add some fireworks
  if (fireworks.length < fireworks_number) {
    // if we have less fireworks than the starting number, add some of them
    // otherwise, we add them randomly (1% each frame)
    if (random(100) <= 1 || fireworks.length < starting_fireworks) {
      let fx, fy;
      fx = random(margin, 1-margin) * width;
      fy = height;
      fireworks.push(
        new Firework(fx, fy)
      )
    }
  }

  // fireworks animation
  fireworks.forEach((f, i) => {
    f.show();
    f.move();
  });

  // trails animation
  trails.forEach((t, i) => {
    t.show();
    t.move();
  });

  // sparkles animation
  sparkles.forEach((s, i) => {
    s.show();
    s.move();
  })

  // remove explosed fireworks and add new
  let deleted; // number of deleted fireworks
  deleted = 0;
  for (let i = fireworks.length - 1; i >= 0; i--) {
    if (!fireworks[i].alive) {
      let balance; // audio pan (left-right)
      balance = map(fireworks[i].position.x, 0, width, -1, 1);
      explosion_sound.pan(balance);
      explosion_sound.play(); // this will throw a LOT of errors. Why? I don't know either. I'm waiting for an updated version.

      fireworks.splice(i, 1); // remove dead firework
      deleted++;
    }
  }
  for (let i = 0; i < deleted; i++) {
    let fx, fy;
    fx = random(margin, 1-margin) * width;
    fy = height;
    fireworks.push(
      new Firework(fx, fy)
    )
  }

  // remove expired trails
  for (let i = trails.length - 1; i >= 0; i--) {
    if (!trails[i].alive) {
      trails.splice(i, 1);
    }
  }

  // remove expired sparkles
  for (let i = sparkles.length - 1; i >= 0; i--) {
    if (!sparkles[i].alive) {
      sparkles.splice(i, 1);
    }
  }
}

function wrap(val, min, max) {
  while (val < min) val += (max - min);
  while (val > max) val -= (max - min);
  return val;
}

class Title {
  constructor(font) {
    this.font = font;

    if (displayWidth > 600) {
      this.font_size = 96;
    } else {
      this.font_size = 80;
    }

    this.life = 2 * 60;
    this.fade_time = 2 * 60;
    this.alive = true;
    this.fading = false;

    this.text = "FIREWORKS!";

    this.phi = random(1) * TWO_PI; // initial phase
    this.period = 60 * random(1.8, 2.2); // rotation period
    this.zoom = 1;

    this.calculateTheta();
  }

  calculateTheta() {
    this.theta = cos(TWO_PI / this.period * frameCount + this.phi) * PI / 40; // text rotation
    this.zoom = cos(TWO_PI / this.period * frameCount * 1.5 + this.phi * 2) * .1 + 1; // text scale
  }

  show() {
    let alpha;
    if (this.fading) {
      alpha = map(frameCount - this.life, 0, this.fade_time, 255, 0);
    } else {
      alpha = 255;
    }
    this.calculateTheta();

    push();
    translate(width/2, height/2);
    rotate(this.theta);
    scale(this.zoom);
    textAlign(CENTER);
    rectMode(CENTER);
    fill(250, alpha);
    textSize(this.font_size);
    textFont(this.font);
    text(this.text, 0, 0);
    pop();
  }

  update() {
    if (frameCount > this.life + this.fade_time) {
      this.alive = false;
    } else if (frameCount > this.life) {
      this.fading = true;
    }
  }
}

class Disclaimer {
  constructor(font) {
    this.font = font;

    if (displayWidth > 600) {
      this.text = "click to enable sounds effects";
      this.font_size = 20;
      this.y_offset = this.font_size;
    } else {
      this.text = "tap to enable sounds effects";
      this.font_size = 26;
      this.y_offset = 8 * this.font_size;
    }

    this.fade_time = 2 * 60;
    this.fade_start = 0;
    this.alive = true;
    this.fading = false;
  }

  show() {
    let alpha;
    if (this.fading) {
      alpha = map(frameCount - this.fade_start, 0, this.fade_time, 255, 0);
    } else {
      alpha = 255;
    }

    push();
    translate(width/2, height - this.y_offset);
    textAlign(CENTER);
    rectMode(CENTER);
    fill(250, alpha);
    textSize(this.font_size);
    textFont(this.font);
    text(this.text, 0, 0);
    pop();
  }

  update() {
    if (frameCount > this.fade_time - this.fade_start) {
      this.alive = false;
    }
  }

  startFade() {
    if (!this.fading)  {
      this.fading = true;
      this.fade_start = frameCount;
    }
  }
}

class Firework {
  constructor(x, y) {
    this.alive = true;
    this.exploded = false;
    this.position = createVector(x, y);

    if (displayWidth > 600) { // big screen
      this.max_height = random(0.6, 0.8) * height;
      this.wind = random(-1, 1) * PI / 20; // horizontal velocity
      this.size = 4;
    } else {
      this.max_height = random(0.4, 0.9) * height;
      this.wind = random(-1, 1) * PI / 30; // horizontal velocity
      this.size = 7;
    }

    this.speed = random(4, 10);

    this.velocity = createVector(0, -this.speed).rotate(this.wind);
    this.g = 0.5 * Math.pow(this.speed, 2) / this.max_height; // vertical acceleration
    this.acceleration = createVector(0, this.g);

    this.old_pos = [];
    this.queue_length = 4;

    this.max_colors = 2;
    this.has_sparkles = random(1) > .5;
  }

  show() {
    // draw firework
    push();
    translate(this.position.x, this.position.y);
    noStroke();
    fill(255);
    circle(0, 0, this.size);
    pop();

    // add some trail to it
    push();
    stroke(255, 75);
    noFill();
    beginShape();
    for (let i = 0; i < this.old_pos.length; i++) {
      curveVertex(this.old_pos[i].x, this.old_pos[i].y);
    }
    endShape();
    pop();
  }

  move() {
    // move firework
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    // add old position to array
    this.old_pos.push(this.position.copy());
    if (this.old_pos.length > this.queue_length) {
      // remove oldest position if the array is too long
      this.old_pos.shift();
    }

    let epsilon = 0.1;
    if (abs(this.velocity.y) < epsilon) { // firework is going down
      // firework is exploding
      this.alive = false;

      // add trails
      let particles_number, phi, speed, life;
      particles_number = Math.floor(random(10, 20));
      phi = random(TWO_PI);
      speed = random(2, 3);
      life = random(1, 2) * 60;

      let colors, hue;
      colors = Math.floor(random(1, this.max_colors + 1));
      hue = [];
      for (let i = 0; i < colors; i++) {
        hue.push(random(100));
      }

      let seed;
      seed = random(1000);

      for (let j = 0; j < colors; j++) {
        for (let i = 0; i < particles_number; i++) { // add trails
          let heading;
          heading = TWO_PI / particles_number * i + phi + PI/2 * j / colors;

          let dspeed, dlife, dhue, dalpha; // to add some variance to each trail
          dspeed = random(-1, 1) * .03 * abs(cos(heading + seed));;
          dlife = random(-1, 1) * life * 0.2;
          dhue = random(-1, 1) * 2;
          dalpha = random(-5, 5);

          trails.push(
            new Trail(this.position.x, this.position.y, heading, speed + dspeed, life + dlife, hue[j] + dhue, dalpha)
          );

          if (this.has_sparkles) {
            sparkles.push(
              new Sparkle(this.position.x, this.position.y, heading, speed * 1.25 + dspeed, (life + dlife) * 1.5, hue[j] + dhue, dalpha)
            );
          }
        }
      }
    }
  }
}

class Trail {
  constructor(x, y, heading, speed, life, hue, dalpha) {
    this.alive = true;
    this.position = createVector(x, y);
    this.start_position = createVector(x, y);
    this.velocity = createVector(speed, 0).rotate(heading);

    this.created = frameCount;
    this.life = life;

    if (displayWidth < 600) { // small screen -> longest life
      this.life *= 1.5;
    }

    this.hue = wrap(hue, 0, 100);
    this.dalpha = dalpha;

    this.old_pos = [this.start_position];

    this.alpha = 127;

    this.g = random(0.02, 0.04);
    this.acceleration = createVector(0, this.g);
    this.size = 2;

    this.nth_particle = 10;
  }

  show() {
    let age, weight;
    age = frameCount - this.created;
    weight = map(age, 0, this.life, 3, 0);

    push();
    noFill();
    stroke(this.hue, 100, 100, this.alpha);
    strokeWeight(weight);

    beginShape();
    this.old_pos.forEach((p, i) => {
      if (i % this.nth_particle == 0 || i < this.nth_particle) {
        curveVertex(p.x, p.y);
      }
    })

    // honestly i don't understand why the following section works
    // appartently shapes skip the last point or something
    curveVertex(this.position.x, this.position.y);
    curveVertex(this.position.x, this.position.y);
    endShape();

    circle(this.position.x, this.position.y, this.size);
    pop();

  }

  move() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    this.old_pos.push(this.position.copy());

    let age = frameCount - this.created;
    if (age > this.life) {
      this.alive = false;
    }
    this.alpha = map(age, 0, this.life, 100, 0) + this.dalpha;
  }
}

class Sparkle extends Trail {
  show() {
    push();
    translate(this.position.x, this.position.y);
    noStroke();
    fill(this.hue, 100, 100, this.alpha);
    circle(0, 0, this.size);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
  if (!audio_started) {
    userStartAudio(); // start audio context, disabled by default until user interaction
    disclaimer.startFade(); // fade disclaimer
    audio_started = true;
  } else {
    fireworks = [];
    trails = [];
    sparkles = [];
  }
}

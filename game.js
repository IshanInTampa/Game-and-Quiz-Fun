(() => {
  // ============================================================
  // CONFIG
  // ============================================================
  const WIDTH = 960, HEIGHT = 540;

  const GRAVITY = 0.9;
  const MOVE_SPEED = 6.2;
  const JUMP_SPEED = 19.5;

  const PLAYER_W = 36, PLAYER_H = 48;
  const COIN_SIZE = 18;
  const PORTAL_W = 42, PORTAL_H = 70;

  const BG_COLOR = "#f5f7fa";
  const PLATFORM_COLOR = "#282d37";
  const PLAYER_COLOR = "#1e90ff";
  const COIN_COLOR = "#ffbe28";
  const PORTAL_COLOR = "#963cdc";
  const TEXT_COLOR = "#141923";

  const TOTAL_LEVELS = 4;

  // UI timing
  const MSG_MS = 1200;
  const FEEDBACK_MS = 1100;
  const COIN_POP_MS = 350;

  // Controls feel
  const COYOTE_MS = 120;
  const JUMP_BUFFER_MS = 140;
  const JUMP_CUT_MULT = 0.55;

  // Confetti
  const CONFETTI_COUNT = 140;

  // Lives
  const MAX_LIVES = 5;

  // Questions per level
  const QUESTIONS_PER_LEVEL = 4;

  // ============================================================
  // QUESTIONS
  // ============================================================
  const QUESTIONS_BY_LEVEL = {
    1: [
      { year:"1964", question:"Which band helped spark 'Beatlemania' in the U.S. after appearing on The Ed Sullivan Show?",
        options:["The Rolling Stones","The Beatles","The Kinks"], answer:"The Beatles",
        fact:"The Beatles' Ed Sullivan appearance (1964) became a major pop culture moment." },
      { year:"1969", question:"Which music festival became a famous symbol of 1960s youth culture and peace?",
        options:["Altamont","Monterey Pop Festival","Woodstock"], answer:"Woodstock",
        fact:"Woodstock (1969) is one of the most iconic music festivals ever." },
      { year:"1968", question:"Which Beatles song was written as a message of encouragement?",
        options:["Hey Jude","Good Vibrations","Light My Fire"], answer:"Hey Jude",
        fact:"‘Hey Jude’ (1968) became one of The Beatles’ biggest worldwide hits." },
      { year:"1964", question:"Which boxer won the heavyweight title in 1964 and later became known as Muhammad Ali?",
        options:["Joe Frazier","Cassius Clay","George Foreman"], answer:"Cassius Clay",
        fact:"Cassius Clay later changed his name to Muhammad Ali." },
    ],
    2: [
      { year:"1969", question:"What early computer network created in 1969 later evolved into the internet?",
        options:["World Wide Web","Bluetooth","ARPANET"], answer:"ARPANET",
        fact:"ARPANET connected early computers and became a foundation for the internet." },
      { year:"1960s", question:"Which invention replaced vacuum tubes and helped computers become smaller and faster?",
        options:["Typewriters","Transistors","Candles"], answer:"Transistors",
        fact:"Transistors were smaller and more efficient than vacuum tubes." },
      { year:"1968", question:"Who demonstrated early versions of the computer mouse and modern-style computing in 1968?",
        options:["Douglas Engelbart","Thomas Edison","Henry Ford"], answer:"Douglas Engelbart",
        fact:"Engelbart’s 1968 demo showcased the mouse and new ways to interact with computers." },
      { year:"1971", question:"Which invention introduced in 1971 is often considered the first widely used microprocessor?",
        options:["CD player","GPS receiver","Intel 4004"], answer:"Intel 4004",
        fact:"The Intel 4004 helped start the microprocessor revolution in computing." },
    ],
    3: [
      { year:"1961", question:"Which technology made the first human spaceflight possible?",
        options:["Rocket propulsion","Jet skis","Steam engines"], answer:"Rocket propulsion",
        fact:"Powerful rockets made it possible to launch spacecraft into orbit." },
      { year:"1969", question:"Which mission first landed humans on the Moon?",
        options:["Apollo 8","Apollo 11","Apollo 13"], answer:"Apollo 11",
        fact:"Apollo 11 landed astronauts on the Moon in July 1969." },
      { year:"1960s", question:"Which technology allowed phone calls and TV signals to be sent long distances around the world more easily?",
        options:["Horse-drawn wagons","Communication satellites","Smoke signals"], answer:"Communication satellites",
        fact:"Satellites enabled fast long-distance communication and live international broadcasts." },
      { year:"1960s", question:"Which medical technology helped doctors perform complex heart surgeries by circulating blood during operations?",
        options:["Heart-lung machine","Thermometer","Stethoscope"], answer:"Heart-lung machine",
        fact:"Heart-lung machines made many open-heart surgeries possible." },
    ],
    4: [
      { year:"1961", question:"Which dance became a huge early-1960s craze?",
        options:["Disco","Breakdancing","The Twist"], answer:"The Twist",
        fact:"The Twist became a major dance craze in the early 1960s." },
      { year:"1960s", question:"Which animated TV family lived in the Stone Age but acted like a modern family?",
        options:["The Jetsons","Scooby-Doo","The Flintstones"], answer:"The Flintstones",
        fact:"The Flintstones became a classic animated show of the era." },
      { year:"1966", question:"Which TV/music group starred in a show about a made-for-TV band?",
        options:["The Beach Boys","The Monkees","The Doors"], answer:"The Monkees",
        fact:"The Monkees were created for TV and became a real hit music group." },
      { year:"early 1970s", question:"Which genre grew rapidly from the late 1960s into the 1970s and dominated youth music?",
        options:["Rock","Hip-hop","EDM"], answer:"Rock",
        fact:"Rock music expanded into many styles and became a major force in the 1970s." },
    ],
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rect = (x, y, w, h) => ({ x, y, w, h });

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function wrapLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const test = (cur ? cur + " " : "") + w;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function coinOnPlatform(p) {
    return rect(
      p.x + Math.floor(p.w / 2) - Math.floor(COIN_SIZE / 2),
      p.y - COIN_SIZE - 2,
      COIN_SIZE, COIN_SIZE
    );
  }

  // ============================================================
  // RESPONSIVE CANVAS (fix mobile alignment)
  // ============================================================
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    // Fit inside viewport while keeping aspect ratio
    const pad = 20;
    const topUI = 90; // room for hint bar on mobile/desktop
    const maxW = Math.max(320, window.innerWidth - pad);
    const maxH = Math.max(260, window.innerHeight - topUI - pad);

    const scale = Math.min(maxW / WIDTH, maxH / HEIGHT, 1);

    // CSS size
    canvas.style.width = Math.floor(WIDTH * scale) + "px";
    canvas.style.height = Math.floor(HEIGHT * scale) + "px";

    // Real pixel size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(WIDTH * dpr);
    canvas.height = Math.floor(HEIGHT * dpr);

    // Make 1 unit in drawing = 1 unit in game coordinates
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  // ============================================================
  // AUDIO (WebAudio) — safe + simple
  // ============================================================
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  }

  function playToneSequence(freqs, dur, type, gainVal) {
    try {
      ensureAudio();
      const now = audioCtx.currentTime;
      const g = audioCtx.createGain();
      g.gain.value = gainVal;
      g.connect(audioCtx.destination);

      freqs.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        o.type = type;
        o.frequency.value = f;

        const start = now + i * dur;
        const end = start + dur;

        const env = audioCtx.createGain();
        env.gain.setValueAtTime(0.0, start);
        env.gain.linearRampToValueAtTime(1.0, start + 0.02);
        env.gain.linearRampToValueAtTime(0.0, end - 0.02);

        o.connect(env); env.connect(g);
        o.start(start); o.stop(end);
      });
    } catch {}
  }

  const soundCorrect = () => playToneSequence([784, 988, 1175], 0.09, "sine", 0.07);
  const soundWrong   = () => playToneSequence([220, 196, 174], 0.11, "sawtooth", 0.06);

  // ============================================================
  // CONFETTI
  // ============================================================
  const confettiColors = ["#ff5050", "#ffbe28", "#32c878", "#50a0ff", "#be8cff", "#ff78dc"];
  const randChoice = arr => arr[(Math.random() * arr.length) | 0];

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x; this.y = y;
      const angle = (Math.random() * Math.PI * 2) - Math.PI;
      const speed = 2.5 + Math.random() * 5.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (2.0 + Math.random() * 4.0);
      this.size = 3 + ((Math.random() * 5) | 0);
      this.color = randChoice(confettiColors);
      this.life = 40 + ((Math.random() * 45) | 0);
    }
    update() { this.vy += 0.25; this.x += this.vx; this.y += this.vy; this.life -= 1; }
    draw(ctx) { ctx.fillStyle = this.color; ctx.fillRect(this.x | 0, this.y | 0, this.size, this.size); }
  }

  // ============================================================
  // LEVELS
  // ============================================================
  function makeLevel1() {
    const platforms = [
      rect(-200, 500, 1800, 60),
      rect(120, 420, 220, 20),
      rect(420, 360, 240, 20),
      rect(740, 300, 220, 20),
      rect(560, 240, 180, 20),
      rect(300, 190, 200, 20),
      rect(80, 140, 180, 20),
    ];
    const coins = platforms.slice(1).map(coinOnPlatform);
    return { platforms, coins, portal: rect(40, 60, PORTAL_W, PORTAL_H), spawn: [40, 440], name: "Level 1", required_coins: coins.length };
  }

  function makeLevel2() {
    const platforms = [
      rect(-200, 520, 2000, 60),
      rect(140, 460, 200, 20),
      rect(420, 410, 220, 20),
      rect(700, 360, 240, 20),
      rect(420, 310, 220, 20),
      rect(140, 260, 200, 20),
      rect(420, 210, 220, 20),
    ];
    const coins = platforms.slice(1).map(coinOnPlatform);
    return { platforms, coins, portal: rect(720, 160, PORTAL_W, PORTAL_H), spawn: [40, 460], name: "Level 2", required_coins: coins.length };
  }

  function makeLevel3() {
    const platforms = [
      rect(-400, 560, 2400, 70),
      rect(80, 500, 420, 22),
      rect(560, 450, 420, 22),
      rect(140, 400, 420, 22),
      rect(620, 350, 420, 22),
      rect(200, 300, 420, 22),
      rect(680, 250, 420, 22),
      rect(260, 200, 420, 22),
      rect(740, 150, 420, 22),
      rect(320, 100, 420, 22),
    ];
    const coins = platforms.slice(1).map(coinOnPlatform);
    return { platforms, coins, portal: rect(780, 40, PORTAL_W, PORTAL_H), spawn: [40, 500], name: "Level 3", required_coins: coins.length };
  }

  function makeLevel4() {
    const platforms = [
      rect(-300, 560, 2200, 70),
      rect(80, 500, 260, 20),
      rect(400, 420, 260, 20),
      rect(800, 340, 260, 20),
      rect(260, 260, 260, 20),
      rect(600, 180, 260, 20),
      rect(420, 100, 260, 20),
    ];
    const coins = platforms.slice(1).map(coinOnPlatform);
    return { platforms, coins, portal: rect(480, 40, PORTAL_W, PORTAL_H), spawn: [40, 500], name: "Level 4", required_coins: coins.length };
  }

  const LEVELS = [makeLevel1(), makeLevel2(), makeLevel3(), makeLevel4()];

  // ============================================================
  // INPUT (keyboard + touch)
  // ============================================================
  const keys = new Set();
  window.addEventListener("keydown", (e) => {
    keys.add(e.key.toLowerCase());
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) e.preventDefault();
  }, { passive: false });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  // Touch state (no icons/buttons; just touch zones)
  const touchState = { left:false, right:false, jump:false };

  function canvasPosFromEvent(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (WIDTH / r.width);
    const y = (ev.clientY - r.top) * (HEIGHT / r.height);
    return { x, y };
  }

  function applyTouchZones(points) {
    // reset
    touchState.left = false;
    touchState.right = false;
    touchState.jump = false;

    // zones:
    // left third -> move left
    // right third -> move right
    // bottom-right quarter -> jump (easy on thumbs)
    for (const p of points) {
      if (p.x < WIDTH * 0.33) touchState.left = true;
      if (p.x > WIDTH * 0.67) touchState.right = true;
      if (p.x > WIDTH * 0.55 && p.y > HEIGHT * 0.70) touchState.jump = true;
    }
  }

  // Track multi-touch points
  const activePointers = new Map();

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = canvasPosFromEvent(e);
    activePointers.set(e.pointerId, p);
    applyTouchZones(activePointers.values());
    e.preventDefault();
  }, { passive:false });

  canvas.addEventListener("pointermove", (e) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, canvasPosFromEvent(e));
    applyTouchZones(activePointers.values());
    e.preventDefault();
  }, { passive:false });

  function clearPointer(e) {
    activePointers.delete(e.pointerId);
    applyTouchZones(activePointers.values());
    e.preventDefault();
  }

  canvas.addEventListener("pointerup", clearPointer, { passive:false });
  canvas.addEventListener("pointercancel", clearPointer, { passive:false });

  // ============================================================
  // PLAYER
  // ============================================================
  class Player {
    constructor(x, y) {
      this.rect = rect(x, y, PLAYER_W, PLAYER_H);
      this.vx = 0; this.vy = 0;
      this.onGround = false;
      this.lastOnGroundMs = 0;
      this.jumpBufferUntil = 0;
      this.jumpHeld = false;
    }

    requestJump(nowMs) {
      this.jumpBufferUntil = nowMs + JUMP_BUFFER_MS;
      this.jumpHeld = true;
    }
    releaseJump() { this.jumpHeld = false; }

    update(platforms, nowMs, input) {
      const left = input.left;
      const right = input.right;
      const jumpPressed = input.jump;

      this.vx = 0;
      if (left) this.vx = -MOVE_SPEED;
      if (right) this.vx = MOVE_SPEED;

      if (jumpPressed && !this.jumpHeld) this.requestJump(nowMs);
      if (!jumpPressed && this.jumpHeld) this.releaseJump();

      this.vy += GRAVITY;
      this.vy = clamp(this.vy, -50, 25);

      // X resolve
      this.rect.x += this.vx;
      for (const p of platforms) {
        if (intersects(this.rect, p)) {
          if (this.vx > 0) this.rect.x = p.x - this.rect.w;
          else if (this.vx < 0) this.rect.x = p.x + p.w;
        }
      }

      // Y resolve
      this.rect.y += this.vy;
      this.onGround = false;
      for (const p of platforms) {
        if (intersects(this.rect, p)) {
          if (this.vy > 0) {
            this.rect.y = p.y - this.rect.h;
            this.vy = 0;
            this.onGround = true;
            this.lastOnGroundMs = nowMs;
          } else if (this.vy < 0) {
            this.rect.y = p.y + p.h;
            this.vy = 0;
          }
        }
      }

      const canCoyote = (nowMs - this.lastOnGroundMs) <= COYOTE_MS;
      const hasBuffered = nowMs <= this.jumpBufferUntil;

      if (hasBuffered && (this.onGround || canCoyote)) {
        this.vy = -JUMP_SPEED;
        this.onGround = false;
        this.jumpBufferUntil = 0;
        this.lastOnGroundMs = 0;
      }

      if (!this.jumpHeld && this.vy < 0) this.vy *= JUMP_CUT_MULT;
    }
  }

  // ============================================================
  // GAME
  // ============================================================
  class Game {
    constructor() {
      this.lives = MAX_LIVES;
      this.mode = "start"; // start, play, question, feedback, win, game_over, quit

      this.levelIndex = 0;
      this.totalCoins = 0;
      this.levelCoins = 0;
      this.requiredCoins = 0;

      this.portalCooldownUntil = 0;

      this.msg = "";
      this.msgUntil = 0;
      this.coinPopUntil = 0;

      this.levelQuestions = [];
      this.qIndex = 0;
      this.currentQuestion = null;

      this.feedbackTitle = "";
      this.feedbackText = "";
      this.feedbackGood = false;
      this.feedbackUntil = 0;
      this.feedbackNext = null;

      this.confetti = [];

      this.camX = 0; this.camY = 0;
      this.minX = 0; this.maxX = 0;
      this.minY = 0; this.maxY = 0;

      // tap regions for quiz options (mobile)
      this.optionRects = [];

      this.loadLevel(true);

      window.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();

        if (k === "escape") {
          if (this.mode === "play") { this.mode = "quit"; return; }
          if (this.mode === "quit") { this.mode = "play"; return; }
          this.mode = "start";
          return;
        }

        if (this.mode === "start" && k === "enter") {
          ensureAudio();
          this.mode = "play";
        }

        if (this.mode === "quit") {
          if (k === "enter") this.mode = "play"; // resume
          if (k === "q") this.mode = "start";    // quit to start
          return;
        }

        if (this.mode === "question") {
          if (k === "1") this.answerQuestion(0);
          if (k === "2") this.answerQuestion(1);
          if (k === "3") this.answerQuestion(2);
        }

        if (this.mode === "game_over" && k === "r") {
          this.resetWholeGame();
        }
      });

      // Tap support: start, quiz answers, quit modal
      canvas.addEventListener("pointerdown", (e) => {
        const p = canvasPosFromEvent(e);

        // Start screen: tap anywhere to start
        if (this.mode === "start") {
          ensureAudio();
          this.mode = "play";
          return;
        }

        // Quiz: tap an option
        if (this.mode === "question") {
          for (let i = 0; i < this.optionRects.length; i++) {
            const r = this.optionRects[i];
            if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
              this.answerQuestion(i);
              return;
            }
          }
        }

        // Quit modal: tap top = resume, bottom = quit-to-start
        if (this.mode === "quit") {
          if (p.y < HEIGHT * 0.55) this.mode = "play";
          else this.mode = "start";
          return;
        }
      }, { passive:true });
    }

    resetWholeGame() {
      this.lives = MAX_LIVES;
      this.levelIndex = 0;
      this.totalCoins = 0;
      this.loadLevel(true);
      this.mode = "start";
    }

    loadLevel(forceCamera) {
      const base = LEVELS[this.levelIndex];
      this.level = {
        platforms: base.platforms.map(p => ({...p})),
        coins: base.coins.map(c => ({...c})),
        portal: {...base.portal},
        spawn: [...base.spawn],
        name: base.name,
        required_coins: base.required_coins
      };

      this.player = new Player(this.level.spawn[0], this.level.spawn[1]);

      this.levelCoins = 0;
      this.requiredCoins = this.level.required_coins;

      this.computeLevelBounds();
      this.updateCamera(forceCamera);

      const now = performance.now();
      this.portalCooldownUntil = now + 350;
      this.msg = "";
      this.msgUntil = 0;

      const lvl = this.levelIndex + 1;
      this.levelQuestions = (QUESTIONS_BY_LEVEL[lvl] || []).slice(0, QUESTIONS_PER_LEVEL);
      this.qIndex = 0;
      this.currentQuestion = null;

      this.confetti.length = 0;
      this.optionRects = [];
    }

    computeLevelBounds() {
      const all = [...this.level.platforms, this.level.portal, ...this.level.coins];
      this.minX = Math.min(...all.map(r => r.x)) - 200;
      this.maxX = Math.max(...all.map(r => r.x + r.w)) + 200;
      this.minY = Math.min(...all.map(r => r.y)) - 200;
      this.maxY = Math.max(...all.map(r => r.y + r.h)) + 200;
    }

    updateCamera(force) {
      const targetX = (this.player.rect.x + this.player.rect.w/2) - WIDTH/2;
      const targetY = (this.player.rect.y + this.player.rect.h/2) - HEIGHT/2;

      if (force) {
        this.camX = targetX;
        this.camY = targetY;
      } else {
        this.camX = (this.camX + (targetX - this.camX) * 0.12) | 0;
        this.camY = (this.camY + (targetY - this.camY) * 0.12) | 0;
      }

      this.camX = clamp(this.camX, this.minX, this.maxX - WIDTH);
      this.camY = clamp(this.camY, this.minY, this.maxY - HEIGHT);
    }

    worldToScreen(r) { return rect(r.x - this.camX, r.y - this.camY, r.w, r.h); }

    showMessage(text) {
      this.msg = text;
      this.msgUntil = performance.now() + MSG_MS;
    }

    collectCoins() {
      const now = performance.now();
      const remaining = [];
      let gotAny = false;

      for (const c of this.level.coins) {
        if (intersects(this.player.rect, c)) {
          this.levelCoins += 1;
          this.totalCoins += 1;
          gotAny = true;
        } else remaining.push(c);
      }
      this.level.coins = remaining;
      if (gotAny) this.coinPopUntil = now + COIN_POP_MS;
    }

    spawnConfetti() {
      for (let i = 0; i < CONFETTI_COUNT; i++) this.confetti.push(new ConfettiParticle(WIDTH/2, 130));
    }

    beginFeedback(good, title, text, nextAction) {
      const now = performance.now();
      this.feedbackGood = good;
      this.feedbackTitle = title;
      this.feedbackText = text;
      this.feedbackUntil = now + FEEDBACK_MS;
      this.feedbackNext = nextAction;
      this.mode = "feedback";

      if (good) { this.spawnConfetti(); soundCorrect(); }
      else { this.lives -= 1; soundWrong(); }
    }

    startNextQuestion() {
      if (this.qIndex >= this.levelQuestions.length) { this.advanceLevel(); return; }
      this.currentQuestion = this.levelQuestions[this.qIndex];
      this.mode = "question";
      this.optionRects = [];
    }

    answerQuestion(choiceIndex) {
      const q = this.currentQuestion;
      const chosen = q.options[choiceIndex];

      if (chosen === q.answer) {
        this.beginFeedback(true, "Correct!", q.fact, "next_q");
      } else {
        const nextLives = this.lives - 1;
        if (nextLives <= 0) {
          this.beginFeedback(false, "Wrong!", `Correct answer: ${q.answer}`, "game_over");
        } else {
          this.beginFeedback(false, "Wrong!", `Correct answer: ${q.answer}\nLives left: ${nextLives}`, "next_q");
        }
      }
    }

    tryPortal() {
      if (this.levelCoins < this.requiredCoins) {
        const need = this.requiredCoins - this.levelCoins;
        this.showMessage(`Portal locked: collect ${need} more coin(s)!`);
        return;
      }
      this.qIndex = 0;
      this.startNextQuestion();
    }

    advanceLevel() {
      this.levelIndex += 1;
      if (this.levelIndex >= TOTAL_LEVELS) { this.mode = "win"; return; }
      this.loadLevel(true);
      this.mode = "play";
    }

    // ----------------------------
    // DRAWING
    // ----------------------------
    drawPortalGlow(nowMs) {
      const pr = this.worldToScreen(this.level.portal);
      const cx = pr.x + pr.w / 2;
      const cy = pr.y + pr.h / 2;

      const pulse = 0.5 + 0.5 * Math.sin(nowMs * 0.004);
      const glowPad = 16 + pulse * 10;

      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(pr.w, pr.h) + glowPad);
      grad.addColorStop(0, `rgba(190,140,255,${0.22 + pulse * 0.20})`);
      grad.addColorStop(0.6, `rgba(150,60,220,${0.10 + pulse * 0.10})`);
      grad.addColorStop(1, "rgba(150,60,220,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pr.w/2 + glowPad, pr.h/2 + glowPad, 0, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = PORTAL_COLOR;
      roundRect(ctx, pr.x, pr.y, pr.w, pr.h, 10);
      ctx.fill();

      ctx.strokeStyle = `rgba(190,140,255,${0.35 + pulse * 0.35})`;
      ctx.lineWidth = 3;
      roundRect(ctx, pr.x - 5, pr.y - 5, pr.w + 10, pr.h + 10, 12);
      ctx.stroke();
    }

    drawHUD(nowMs) {
      const barX = 14, barY = 12, barW = WIDTH - 28, barH = 66;
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, barX, barY, barW, barH, 14);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "#e2e6ee";
      ctx.lineWidth = 1;
      roundRect(ctx, barX, barY, barW, barH, 14);
      ctx.stroke();

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = (nowMs < this.coinPopUntil) ? "bold 22px Arial" : "bold 20px Arial";
      ctx.fillText(
        `${this.level.name}  •  Coins: ${this.levelCoins}/${this.requiredCoins}  •  Total: ${this.totalCoins}  •  Lives: ${this.lives}`,
        barX + 18, barY + 30
      );

      ctx.fillStyle = "#3c4652";
      ctx.font = "14px Arial";
      ctx.fillText(
        `Move: A/D or ←/→   Jump: Space/W/↑   Touch portal for quiz   Esc: Quit`,
        barX + 18, barY + 54
      );

      if (nowMs < this.msgUntil && this.msg) {
        ctx.fillStyle = "#b42828";
        ctx.font = "bold 22px Arial";
        const w = ctx.measureText(this.msg).width;
        ctx.fillText(this.msg, (WIDTH - w) / 2, barY + barH + 30);
      }
    }

    drawWorld(nowMs) {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = PLATFORM_COLOR;
      for (const p of this.level.platforms) {
        const r = this.worldToScreen(p);
        roundRect(ctx, r.x, r.y, r.w, r.h, 6);
        ctx.fill();
      }

      ctx.fillStyle = COIN_COLOR;
      for (const c of this.level.coins) {
        const r = this.worldToScreen(c);
        ctx.beginPath();
        ctx.ellipse(r.x + r.w/2, r.y + r.h/2, r.w/2, r.h/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      this.drawPortalGlow(nowMs);

      const pl = this.worldToScreen(this.player.rect);
      ctx.fillStyle = PLAYER_COLOR;
      roundRect(ctx, pl.x, pl.y, pl.w, pl.h, 8);
      ctx.fill();

      this.drawHUD(nowMs);
    }

    drawStart() {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "bold 42px Arial";
      const title = "Time Travel Platformer + Quiz (4 Levels)";
      ctx.fillText(title, (WIDTH - ctx.measureText(title).width)/2, 120);

      ctx.font = "20px Arial";
      const lines = [
        "Instructions:",
        "• Move with A/D or Left/Right Arrow",
        "• Jump with Space (or W / Up Arrow)",
        "• Collect ALL coins in the level to unlock the portal",
        "• Touch the portal to start a 4-question quiz",
        "• Answer with keys 1 / 2 / 3 (or tap the answers on mobile)",
        `• You have ${MAX_LIVES} lives (wrong answers reduce lives)`,
        "",
        "Press ENTER to start (desktop)  •  Tap anywhere to start (mobile)"
      ];
      let y = 185;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        ctx.fillText(line, (WIDTH - w)/2, y);
        y += 28;
      }
    }

    drawQuestion(nowMs) {
      this.drawWorld(nowMs);

      const card = rect(80, 90, WIDTH - 160, HEIGHT - 180);
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, card.x, card.y, card.w, card.h, 18);
      ctx.fill();
      ctx.strokeStyle = "#d2d2d2";
      ctx.lineWidth = 2;
      roundRect(ctx, card.x, card.y, card.w, card.h, 18);
      ctx.stroke();

      const q = this.currentQuestion;
      const lvl = this.levelIndex + 1;

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "bold 26px Arial";
      ctx.fillText(
        `Level ${lvl} Quiz — Q${this.qIndex + 1}/${this.levelQuestions.length} (Year: ${q.year})`,
        card.x + 20, card.y + 42
      );

      ctx.font = "20px Arial";
      const qLines = wrapLines(ctx, q.question, card.w - 40);
      let y = card.y + 80;
      for (const line of qLines) {
        ctx.fillText(line, card.x + 20, y);
        y += 24;
      }

      // options: draw as tappable rows
      this.optionRects = [];
      y += 12;
      for (let i = 0; i < q.options.length; i++) {
        const row = rect(card.x + 18, y - 18, card.w - 36, 40);
        this.optionRects.push(row);

        ctx.fillStyle = "rgba(226,230,238,0.65)";
        roundRect(ctx, row.x, row.y, row.w, row.h, 12);
        ctx.fill();

        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "20px Arial";
        ctx.fillText(`${i+1}) ${q.options[i]}`, row.x + 14, y + 10);

        y += 52;
      }

      ctx.fillStyle = "#555";
      ctx.font = "16px Arial";
      ctx.fillText("Press 1 / 2 / 3 or tap an answer", card.x + 20, card.y + card.h - 18);
    }

    drawFeedback() {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (const p of this.confetti) { p.update(); p.draw(ctx); }
      this.confetti = this.confetti.filter(p => p.life > 0 && p.y < HEIGHT + 80);

      const color = this.feedbackGood ? "#147828" : "#b42828";
      ctx.fillStyle = color;
      ctx.font = "bold 42px Arial";
      const t = this.feedbackTitle;
      ctx.fillText(t, (WIDTH - ctx.measureText(t).width)/2, 200);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "20px Arial";
      const lines = this.feedbackText.split("\n").flatMap(line => wrapLines(ctx, line, WIDTH - 180));
      let y = 255;
      for (const line of lines.slice(0, 7)) {
        ctx.fillText(line, (WIDTH - ctx.measureText(line).width)/2, y);
        y += 28;
      }
    }

    drawWin() {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#147828";
      ctx.font = "bold 42px Arial";
      const t = "YOU WIN!";
      ctx.fillText(t, (WIDTH - ctx.measureText(t).width)/2, 210);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "20px Arial";
      const s = `Total Coins Collected: ${this.totalCoins}`;
      ctx.fillText(s, (WIDTH - ctx.measureText(s).width)/2, 260);
    }

    drawGameOver() {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#b42828";
      ctx.font = "bold 42px Arial";
      const t = "GAME OVER";
      ctx.fillText(t, (WIDTH - ctx.measureText(t).width)/2, 210);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "20px Arial";
      ctx.fillText("You ran out of lives.", (WIDTH - ctx.measureText("You ran out of lives.").width)/2, 260);

      ctx.font = "16px Arial";
      ctx.fillText("Press R to restart (desktop) or refresh page (mobile).", (WIDTH - ctx.measureText("Press R to restart (desktop) or refresh page (mobile).").width)/2, 292);
    }

    drawQuitModal() {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();

      const cardW = 520, cardH = 240;
      const x = (WIDTH - cardW) / 2;
      const y = (HEIGHT - cardH) / 2;

      ctx.fillStyle = "#fff";
      roundRect(ctx, x, y, cardW, cardH, 18);
      ctx.fill();

      ctx.strokeStyle = "#d2d2d2";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cardW, cardH, 18);
      ctx.stroke();

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "bold 34px Arial";
      const title = "Quit Game?";
      ctx.fillText(title, x + (cardW - ctx.measureText(title).width)/2, y + 70);

      ctx.font = "18px Arial";
      ctx.fillStyle = "#3c4652";
      const a = "Tap upper area to Resume";
      const b = "Tap lower area to Quit to Start screen";
      ctx.fillText(a, x + (cardW - ctx.measureText(a).width)/2, y + 125);
      ctx.fillText(b, x + (cardW - ctx.measureText(b).width)/2, y + 155);
    }

    update(nowMs) {
      // Merge keyboard + touch
      const input = {
        left:  (keys.has("a") || keys.has("arrowleft")  || touchState.left),
        right: (keys.has("d") || keys.has("arrowright") || touchState.right),
        jump:  (keys.has(" ") || keys.has("w") || keys.has("arrowup") || touchState.jump),
      };

      if (this.mode === "play") {
        this.player.update(this.level.platforms, nowMs, input);
        this.collectCoins();
        this.updateCamera(false);

        if (nowMs >= this.portalCooldownUntil && intersects(this.player.rect, this.level.portal)) {
          this.portalCooldownUntil = nowMs + 400;
          this.tryPortal();
        }
      }

      if (this.mode === "feedback" && nowMs >= this.feedbackUntil) {
        if (this.feedbackNext === "next_q") {
          if (this.lives <= 0) this.mode = "game_over";
          else { this.qIndex += 1; this.startNextQuestion(); }
        } else if (this.feedbackNext === "game_over") {
          this.mode = "game_over";
        }
      }
    }

    render(nowMs) {
      if (this.mode === "start") return this.drawStart();
      if (this.mode === "play") return this.drawWorld(nowMs);
      if (this.mode === "question") return this.drawQuestion(nowMs);
      if (this.mode === "feedback") return this.drawFeedback();
      if (this.mode === "win") return this.drawWin();
      if (this.mode === "game_over") return this.drawGameOver();
      if (this.mode === "quit") { this.drawWorld(nowMs); return this.drawQuitModal(); }
    }
  }

  // ============================================================
  // BOOT
  // ============================================================
  const game = new Game();

  // First paint immediately (so never blank)
  game.render(performance.now());

  function loop(now) {
    game.update(now);
    game.render(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

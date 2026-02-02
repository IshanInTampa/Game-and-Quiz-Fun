(() => {
  // ----------------------------
  // CONFIG
  // ----------------------------
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

  // ----------------------------
  // QUESTIONS
  // ----------------------------
  const QUESTIONS_BY_LEVEL = {
    1: [
      {
        year: "1964",
        question: "Which band helped spark 'Beatlemania' in the U.S. after appearing on The Ed Sullivan Show?",
        options: ["The Rolling Stones", "The Beatles", "The Kinks"],
        answer: "The Beatles",
        fact: "The Beatles' Ed Sullivan appearance (1964) became a major pop culture moment.",
      },
      {
        year: "1969",
        question: "Which music festival became a famous symbol of 1960s youth culture and peace?",
        options: ["Altamont", "Monterey Pop Festival", "Woodstock"],
        answer: "Woodstock",
        fact: "Woodstock (1969) is one of the most iconic music festivals ever.",
      },
      {
        year: "1968",
        question: "Which Beatles song was written as a message of encouragement?",
        options: ["Hey Jude", "Good Vibrations", "Light My Fire"],
        answer: "Hey Jude",
        fact: "‘Hey Jude’ (1968) became one of The Beatles’ biggest worldwide hits.",
      },
      {
        year: "1964",
        question: "Which boxer won the heavyweight title in 1964 and later became known as Muhammad Ali?",
        options: ["Joe Frazier", "Cassius Clay", "George Foreman"],
        answer: "Cassius Clay",
        fact: "Cassius Clay later changed his name to Muhammad Ali.",
      },
    ],
    2: [
      {
        year: "1969",
        question: "What early computer network created in 1969 later evolved into the internet?",
        options: ["World Wide Web", "Bluetooth", "ARPANET"],
        answer: "ARPANET",
        fact: "ARPANET connected early computers and became a foundation for the internet.",
      },
      {
        year: "1960s",
        question: "Which invention replaced vacuum tubes and helped computers become smaller and faster?",
        options: ["Typewriters", "Transistors", "Candles"],
        answer: "Transistors",
        fact: "Transistors were smaller and more efficient than vacuum tubes.",
      },
      {
        year: "1968",
        question: "Who demonstrated early versions of the computer mouse and modern-style computing in 1968?",
        options: ["Douglas Engelbart", "Thomas Edison", "Henry Ford"],
        answer: "Douglas Engelbart",
        fact: "Engelbart’s 1968 demo showcased the mouse and new ways to interact with computers.",
      },
      {
        year: "1971",
        question: "Which invention introduced in 1971 is often considered the first widely used microprocessor?",
        options: ["CD player", "GPS receiver", "Intel 4004"],
        answer: "Intel 4004",
        fact: "The Intel 4004 helped start the microprocessor revolution in computing.",
      },
    ],
    3: [
      {
        year: "1961",
        question: "Which technology made the first human spaceflight possible?",
        options: ["Rocket propulsion", "Jet skis", "Steam engines"],
        answer: "Rocket propulsion",
        fact: "Powerful rockets made it possible to launch spacecraft into orbit.",
      },
      {
        year: "1969",
        question: "Which mission first landed humans on the Moon?",
        options: ["Apollo 8", "Apollo 11", "Apollo 13"],
        answer: "Apollo 11",
        fact: "Apollo 11 landed astronauts on the Moon in July 1969.",
      },
      {
        year: "1960s",
        question: "Which technology allowed phone calls and TV signals to be sent long distances around the world more easily?",
        options: ["Horse-drawn wagons", "Communication satellites", "Smoke signals"],
        answer: "Communication satellites",
        fact: "Satellites enabled fast long-distance communication and live international broadcasts.",
      },
      {
        year: "1960s",
        question: "Which medical technology helped doctors perform complex heart surgeries by circulating blood during operations?",
        options: ["Heart-lung machine", "Thermometer", "Stethoscope"],
        answer: "Heart-lung machine",
        fact: "Heart-lung machines made many open-heart surgeries possible.",
      },
    ],
    4: [
      {
        year: "1961",
        question: "Which dance became a huge early-1960s craze?",
        options: ["Disco", "Breakdancing", "The Twist"],
        answer: "The Twist",
        fact: "The Twist became a major dance craze in the early 1960s.",
      },
      {
        year: "1960s",
        question: "Which animated TV family lived in the Stone Age but acted like a modern family?",
        options: ["The Jetsons", "Scooby-Doo", "The Flintstones"],
        answer: "The Flintstones",
        fact: "The Flintstones became a classic animated show of the era.",
      },
      {
        year: "1966",
        question: "Which TV/music group starred in a show about a made-for-TV band?",
        options: ["The Beach Boys", "The Monkees", "The Doors"],
        answer: "The Monkees",
        fact: "The Monkees were created for TV and became a real hit music group.",
      },
      {
        year: "early 1970s",
        question: "Which genre grew rapidly from the late 1960s into the 1970s and dominated youth music?",
        options: ["Rock", "Hip-hop", "EDM"],
        answer: "Rock",
        fact: "Rock music expanded into many styles and became a major force in the 1970s.",
      },
    ],
  };

  // ----------------------------
  // Helpers
  // ----------------------------
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function wrapLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const test = (cur ? cur + " " : "") + w;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function rect(x, y, w, h) { return { x, y, w, h }; }

  function intersects(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  function coinOnPlatform(p) {
    return rect(
      p.x + Math.floor(p.w / 2) - Math.floor(COIN_SIZE / 2),
      p.y - COIN_SIZE - 2,
      COIN_SIZE,
      COIN_SIZE
    );
  }

  // ----------------------------
  // WebAudio simple sounds
  // ----------------------------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playToneSequence(freqs, dur = 0.1, type = "sine", gainVal = 0.06) {
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

        o.connect(env);
        env.connect(g);

        o.start(start);
        o.stop(end);
      });
    } catch {}
  }

  function soundCorrect() { playToneSequence([784, 988, 1175], 0.09, "sine", 0.07); }
  function soundWrong()   { playToneSequence([220, 196, 174], 0.11, "sawtooth", 0.06); }

  // ----------------------------
  // Confetti
  // ----------------------------
  function randChoice(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function confettiColor() {
    return randChoice(["#ff5050", "#ffbe28", "#32c878", "#50a0ff", "#be8cff", "#ff78dc"]);
  }

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = (Math.random() * Math.PI * 2) - Math.PI;
      const speed = 2.5 + Math.random() * 5.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (2.0 + Math.random() * 4.0);
      this.size = 3 + ((Math.random() * 5) | 0);
      this.color = confettiColor();
      this.life = 40 + ((Math.random() * 45) | 0);
    }
    update() {
      this.vy += 0.25;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 1;
    }
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x | 0, this.y | 0, this.size, this.size);
    }
  }

  // ----------------------------
  // Levels
  // ----------------------------
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
      rect(-400, 560, 2400, 70)

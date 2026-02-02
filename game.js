import pygame
import sys
import math
import random
import os
import wave
import struct
console.log("game.js loaded ✅");

# ----------------------------
# CONFIG
# ----------------------------
WIDTH, HEIGHT = 960, 540
FPS = 60

# Easier gaps + forgiving jumps (tuned)
GRAVITY = 0.76
MOVE_SPEED = 6.8        # ground speed (kept reasonable)
AIR_SPEED_MULT = 1.30   # extra distance while airborne (gap helper)
JUMP_SPEED = 22.3       # higher jump = easier clears

PLAYER_W, PLAYER_H = 36, 48
COIN_SIZE = 18
PORTAL_W, PORTAL_H = 42, 70

BG_COLOR = (245, 247, 250)
PLATFORM_COLOR = (40, 45, 55)
PLAYER_COLOR = (30, 144, 255)
COIN_COLOR = (255, 190, 40)
PORTAL_COLOR = (150, 60, 220)
TEXT_COLOR = (20, 25, 35)
OVERLAY_BG = (255, 255, 255)

TOTAL_LEVELS = 4

# UI timing
MSG_MS = 1200
FEEDBACK_MS = 1100
COIN_POP_MS = 350

# Controls feel (more forgiving)
COYOTE_MS = 210
JUMP_BUFFER_MS = 260
JUMP_CUT_MULT = 0.84

# Confetti
CONFETTI_COUNT = 140

# Lives
MAX_LIVES = 5

# How many questions at end of each level
QUESTIONS_PER_LEVEL = 4

# ----------------------------
# QUESTIONS (4 per level)
# ----------------------------
QUESTIONS_BY_LEVEL = {
    1: [
        {
            "year": "1964",
            "question": "Which band helped spark 'Beatlemania' in the U.S. after appearing on The Ed Sullivan Show?",
            "options": ["The Rolling Stones", "The Beatles", "The Kinks"],
            "answer": "The Beatles",
            "fact": "The Beatles' Ed Sullivan appearance (1964) became a major pop culture moment.",
        },
        {
            "year": "1969",
            "question": "Which music festival became a famous symbol of 1960s youth culture and peace?",
            "options": ["Altamont", "Monterey Pop Festival", "Woodstock"],
            "answer": "Woodstock",
            "fact": "Woodstock (1969) is one of the most iconic music festivals ever.",
        },
        {
            "year": "1968",
            "question": "Which Beatles song was written as a message of encouragement?",
            "options": ["Hey Jude", "Good Vibrations", "Light My Fire"],
            "answer": "Hey Jude",
            "fact": "‘Hey Jude’ (1968) became one of The Beatles’ biggest worldwide hits.",
        },
        {
            "year": "1964",
            "question": "Which boxer won the heavyweight title in 1964 and later became known as Muhammad Ali?",
            "options": ["Joe Frazier", "Cassius Clay", "George Foreman"],
            "answer": "Cassius Clay",
            "fact": "Cassius Clay later changed his name to Muhammad Ali.",
        },
    ],
    2: [
        {
            "year": "1969",
            "question": "What early computer network created in 1969 later evolved into the internet?",
            "options": ["World Wide Web", "Bluetooth", "ARPANET"],
            "answer": "ARPANET",
            "fact": "ARPANET connected early computers and became a foundation for the internet.",
        },
        {
            "year": "1960s",
            "question": "Which invention replaced vacuum tubes and helped computers become smaller and faster?",
            "options": ["Typewriters", "Transistors", "Candles"],
            "answer": "Transistors",
            "fact": "Transistors were smaller and more efficient than vacuum tubes.",
        },
        {
            "year": "1968",
            "question": "Who demonstrated early versions of the computer mouse and modern-style computing in 1968?",
            "options": ["Douglas Engelbart", "Thomas Edison", "Henry Ford"],
            "answer": "Douglas Engelbart",
            "fact": "Engelbart’s 1968 demo showcased the mouse and new ways to interact with computers.",
        },
        {
            "year": "1971",
            "question": "Which invention introduced in 1971 is often considered the first widely used microprocessor?",
            "options": ["CD player", "GPS receiver", "Intel 4004"],
            "answer": "Intel 4004",
            "fact": "The Intel 4004 helped start the microprocessor revolution in computing.",
        },
    ],
    3: [
        {
            "year": "1961",
            "question": "Which technology made the first human spaceflight possible?",
            "options": ["Rocket propulsion", "Jet skis", "Steam engines"],
            "answer": "Rocket propulsion",
            "fact": "Powerful rockets made it possible to launch spacecraft into orbit.",
        },
        {
            "year": "1969",
            "question": "Which mission first landed humans on the Moon?",
            "options": ["Apollo 8", "Apollo 11", "Apollo 13"],
            "answer": "Apollo 11",
            "fact": "Apollo 11 landed astronauts on the Moon in July 1969.",
        },
        {
            "year": "1960s",
            "question": "Which technology allowed phone calls and TV signals to be sent long distances around the world more easily?",
            "options": ["Horse-drawn wagons", "Communication satellites", "Smoke signals"],
            "answer": "Communication satellites",
            "fact": "Satellites enabled fast long-distance communication and live international broadcasts.",
        },
        {
            "year": "1960s",
            "question": "Which medical technology helped doctors perform complex heart surgeries by circulating blood during operations?",
            "options": ["Heart-lung machine", "Thermometer", "Stethoscope"],
            "answer": "Heart-lung machine",
            "fact": "Heart-lung machines made many open-heart surgeries possible.",
        },
    ],
    4: [
        {
            "year": "1961",
            "question": "Which dance became a huge early-1960s craze?",
            "options": ["Disco", "Breakdancing", "The Twist"],
            "answer": "The Twist",
            "fact": "The Twist became a major dance craze in the early 1960s.",
        },
        {
            "year": "1960s",
            "question": "Which animated TV family lived in the Stone Age but acted like a modern family?",
            "options": ["The Jetsons", "Scooby-Doo", "The Flintstones"],
            "answer": "The Flintstones",
            "fact": "The Flintstones became a classic animated show of the era.",
        },
        {
            "year": "1966",
            "question": "Which TV/music group starred in a show about a made-for-TV band?",
            "options": ["The Beach Boys", "The Monkees", "The Doors"],
            "answer": "The Monkees",
            "fact": "The Monkees were created for TV and became a real hit music group.",
        },
        {
            "year": "early 1970s",
            "question": "Which genre grew rapidly from the late 1960s into the 1970s and dominated youth music?",
            "options": ["Rock", "Hip-hop", "EDM"],
            "answer": "Rock",
            "fact": "Rock music expanded into many styles and became a major force in the 1970s.",
        },
    ],
}

# ----------------------------
# HELPERS
# ----------------------------
def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def wrap_lines(font, text, max_width):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        if font.size(test)[0] <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def coin_on_platform(p: pygame.Rect) -> pygame.Rect:
    return pygame.Rect(
        p.x + p.w // 2 - COIN_SIZE // 2,
        p.y - COIN_SIZE - 2,
        COIN_SIZE,
        COIN_SIZE
    )

# ----------------------------
# SIMPLE SOUND GENERATION
# ----------------------------
def ensure_wav(filename, tones, duration=0.12, sample_rate=44100, volume=0.40):
    if os.path.exists(filename):
        return
    with wave.open(filename, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        chunk_len = int(sample_rate * duration)
        for f in tones:
            for n in range(chunk_len):
                t = n / sample_rate
                env = 1.0
                fade = 0.02
                if t < fade:
                    env = t / fade
                elif t > duration - fade:
                    env = max(0.0, (duration - t) / fade)
                sample = volume * env * math.sin(2 * math.pi * f * t)
                wf.writeframesraw(struct.pack("<h", int(sample * 32767)))

def safe_load_sound(path):
    try:
        return pygame.mixer.Sound(path)
    except Exception:
        return None

# ----------------------------
# CONFETTI
# ----------------------------
def random_confetti_color():
    return random.choice([
        (255, 80, 80),
        (255, 190, 40),
        (50, 200, 120),
        (80, 160, 255),
        (190, 140, 255),
        (255, 120, 220),
    ])

class ConfettiParticle:
    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)
        angle = random.uniform(-math.pi, math.pi)
        speed = random.uniform(2.5, 8.0)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed - random.uniform(2.0, 6.0)
        self.size = random.randint(3, 7)
        self.color = random_confetti_color()
        self.life = random.randint(40, 85)

    def update(self):
        self.vy += 0.25
        self.x += self.vx
        self.y += self.vy
        self.life -= 1

    def draw(self, surf):
        pygame.draw.rect(surf, self.color, pygame.Rect(int(self.x), int(self.y), self.size, self.size))

# ----------------------------
# LEVELS (1–4)
# ----------------------------
def make_level_1():
    platforms = [
        pygame.Rect(-200, 500, 1800, 60),
        pygame.Rect(120, 420, 220, 20),
        pygame.Rect(420, 360, 240, 20),
        pygame.Rect(740, 300, 220, 20),
        pygame.Rect(560, 240, 180, 20),
        pygame.Rect(300, 190, 200, 20),
        pygame.Rect(80, 140, 180, 20),
    ]
    coins = [coin_on_platform(p) for p in platforms[1:]]
    return {"platforms": platforms, "coins": coins, "portal": pygame.Rect(40, 60, PORTAL_W, PORTAL_H),
            "spawn": (40, 440), "name": "Level 1", "required_coins": len(coins)}

def make_level_2():
    platforms = [
        pygame.Rect(-200, 520, 2000, 60),
        pygame.Rect(140, 460, 200, 20),
        pygame.Rect(420, 410, 220, 20),
        pygame.Rect(700, 360, 240, 20),
        pygame.Rect(420, 310, 220, 20),
        pygame.Rect(140, 260, 200, 20),
        pygame.Rect(420, 210, 220, 20),
    ]
    coins = [coin_on_platform(p) for p in platforms[1:]]
    return {"platforms": platforms, "coins": coins, "portal": pygame.Rect(720, 160, PORTAL_W, PORTAL_H),
            "spawn": (40, 460), "name": "Level 2", "required_coins": len(coins)}

def make_level_3():
    platforms = [
        pygame.Rect(-400, 560, 2400, 70),
        pygame.Rect(80, 500, 420, 22),
        pygame.Rect(560, 450, 420, 22),
        pygame.Rect(140, 400, 420, 22),
        pygame.Rect(620, 350, 420, 22),
        pygame.Rect(200, 300, 420, 22),
        pygame.Rect(680, 250, 420, 22),
        pygame.Rect(260, 200, 420, 22),
        pygame.Rect(740, 150, 420, 22),
        pygame.Rect(320, 100, 420, 22),
    ]
    coins = [coin_on_platform(p) for p in platforms[1:]]
    return {"platforms": platforms, "coins": coins, "portal": pygame.Rect(780, 40, PORTAL_W, PORTAL_H),
            "spawn": (40, 500), "name": "Level 3", "required_coins": len(coins)}

def make_level_4():
    platforms = [
        pygame.Rect(-300, 560, 2200, 70),
        pygame.Rect(80, 500, 260, 20),
        pygame.Rect(400, 420, 260, 20),
        pygame.Rect(900, 340, 260, 20),
        pygame.Rect(260, 260, 260, 20),
        pygame.Rect(1000, 180, 260, 20),
        pygame.Rect(420, 100, 260, 20),
    ]
    coins = [coin_on_platform(p) for p in platforms[1:]]
    return {"platforms": platforms, "coins": coins, "portal": pygame.Rect(480, 40, PORTAL_W, PORTAL_H),
            "spawn": (40, 500), "name": "Level 4", "required_coins": len(coins)}

LEVELS = [make_level_1(), make_level_2(), make_level_3(), make_level_4()]

# ----------------------------
# PLAYER
# ----------------------------
class Player:
    def __init__(self, x, y):
        self.rect = pygame.Rect(x, y, PLAYER_W, PLAYER_H)
        self.vx = 0.0
        self.vy = 0.0
        self.on_ground = False
        self.last_on_ground_ms = 0
        self.jump_buffer_until_ms = 0
        self.jump_held = False

    def request_jump(self, now_ms):
        self.jump_buffer_until_ms = now_ms + JUMP_BUFFER_MS
        self.jump_held = True

    def release_jump(self):
        self.jump_held = False

    def update(self, platforms, now_ms):
        keys = pygame.key.get_pressed()

        # ✅ Air speed boost (helps clear gaps)
        speed = MOVE_SPEED * (1.0 if self.on_ground else AIR_SPEED_MULT)

        self.vx = 0.0
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.vx = -speed
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.vx = speed

        self.vy += GRAVITY
        self.vy = clamp(self.vy, -50, 25)

        self.rect.x += int(self.vx)
        for p in platforms:
            if self.rect.colliderect(p):
                if self.vx > 0:
                    self.rect.right = p.left
                elif self.vx < 0:
                    self.rect.left = p.right

        self.rect.y += int(self.vy)
        self.on_ground = False
        for p in platforms:
            if self.rect.colliderect(p):
                if self.vy > 0:
                    self.rect.bottom = p.top
                    self.vy = 0
                    self.on_ground = True
                    self.last_on_ground_ms = now_ms
                elif self.vy < 0:
                    self.rect.top = p.bottom
                    self.vy = 0

        can_coyote = (now_ms - self.last_on_ground_ms) <= COYOTE_MS
        has_buffered_jump = now_ms <= self.jump_buffer_until_ms

        if has_buffered_jump and (self.on_ground or can_coyote):
            self.vy = -JUMP_SPEED
            self.on_ground = False
            self.jump_buffer_until_ms = 0
            self.last_on_ground_ms = 0

        if (not self.jump_held) and self.vy < 0:
            self.vy *= JUMP_CUT_MULT

# ----------------------------
# GAME
# ----------------------------
class Game:
    def __init__(self):
        pygame.init()

        self.lives = MAX_LIVES

        self.snd_correct = None
        self.snd_wrong = None
        try:
            pygame.mixer.init()
            ensure_wav("correct.wav", tones=[784, 988, 1175], duration=0.10, volume=0.35)
            ensure_wav("wrong.wav", tones=[220, 196, 174], duration=0.14, volume=0.45)
            self.snd_correct = safe_load_sound("correct.wav")
            self.snd_wrong = safe_load_sound("wrong.wav")
        except Exception:
            self.snd_correct = None
            self.snd_wrong = None

        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Time Travel Platformer + Quiz (4 Levels)")
        self.clock = pygame.time.Clock()

        self.font = pygame.font.SysFont("arial", 20)
        self.big = pygame.font.SysFont("arial", 34, bold=True)
        self.huge = pygame.font.SysFont("arial", 42, bold=True)

        self.mode = "start"  # start, play, question, feedback, win, game_over
        self.level_index = 0

        self.total_coins = 0
        self.level_coins = 0
        self.required_coins = 0
        self.coin_pop_until = 0

        self.portal_cooldown_until = 0
        self.msg = ""
        self.msg_until = 0

        self.level_questions = []
        self.q_index = 0
        self.current_question = None

        self.feedback_title = ""
        self.feedback_text = ""
        self.feedback_good = False
        self.feedback_until = 0
        self.feedback_next = None

        self.confetti = []

        self.cam_x = 0
        self.cam_y = 0
        self.min_x = 0
        self.max_x = 0
        self.min_y = 0
        self.max_y = 0

        self.load_level(force_camera=True)

    def reset_whole_game(self):
        self.lives = MAX_LIVES
        self.level_index = 0
        self.total_coins = 0
        self.load_level(force_camera=True)
        self.mode = "start"

    def load_level(self, force_camera=False):
        base = LEVELS[self.level_index]
        self.level = {
            "platforms": list(base["platforms"]),
            "coins": list(base["coins"]),
            "portal": base["portal"].copy(),
            "spawn": base["spawn"],
            "name": base["name"],
            "required_coins": base["required_coins"],
        }
        self.player = Player(*self.level["spawn"])
        self.level_coins = 0
        self.required_coins = self.level["required_coins"]

        self.compute_level_bounds()
        self.update_camera(force=force_camera)

        now = pygame.time.get_ticks()
        self.portal_cooldown_until = now + 350
        self.msg = ""
        self.msg_until = 0

        lvl_num = self.level_index + 1
        self.level_questions = list(QUESTIONS_BY_LEVEL.get(lvl_num, []))[:QUESTIONS_PER_LEVEL]
        self.q_index = 0
        self.current_question = None

        self.confetti.clear()

    def compute_level_bounds(self):
        all_rects = self.level["platforms"] + [self.level["portal"]] + self.level["coins"]
        self.min_x = min(r.left for r in all_rects) - 200
        self.max_x = max(r.right for r in all_rects) + 200
        self.min_y = min(r.top for r in all_rects) - 200
        self.max_y = max(r.bottom for r in all_rects) + 200

    def update_camera(self, force=False):
        target_x = self.player.rect.centerx - WIDTH // 2
        target_y = self.player.rect.centery - HEIGHT // 2

        if force:
            self.cam_x = target_x
            self.cam_y = target_y
        else:
            self.cam_x = int(self.cam_x + (target_x - self.cam_x) * 0.12)
            self.cam_y = int(self.cam_y + (target_y - self.cam_y) * 0.12)

        self.cam_x = clamp(self.cam_x, self.min_x, self.max_x - WIDTH)
        self.cam_y = clamp(self.cam_y, self.min_y, self.max_y - HEIGHT)

    def world_to_screen(self, rect):
        return pygame.Rect(rect.x - self.cam_x, rect.y - self.cam_y, rect.w, rect.h)

    def show_message(self, text):
        self.msg = text
        self.msg_until = pygame.time.get_ticks() + MSG_MS

    def collect_coins(self):
        remaining = []
        got_any = False
        for c in self.level["coins"]:
            if self.player.rect.colliderect(c):
                self.level_coins += 1
                self.total_coins += 1
                got_any = True
            else:
                remaining.append(c)
        self.level["coins"] = remaining
        if got_any:
            self.coin_pop_until = pygame.time.get_ticks() + COIN_POP_MS

    def spawn_confetti(self):
        for _ in range(CONFETTI_COUNT):
            self.confetti.append(ConfettiParticle(WIDTH // 2, 130))

    def begin_feedback(self, good, title, text, next_action):
        now = pygame.time.get_ticks()
        self.feedback_good = good
        self.feedback_title = title
        self.feedback_text = text
        self.feedback_until = now + FEEDBACK_MS
        self.feedback_next = next_action
        self.mode = "feedback"

        if good:
            self.spawn_confetti()
            if self.snd_correct:
                try: self.snd_correct.play()
                except Exception: pass
        else:
            self.lives -= 1
            if self.snd_wrong:
                try: self.snd_wrong.play()
                except Exception: pass

    def start_next_question(self):
        if self.q_index >= len(self.level_questions):
            self.advance_level()
            return
        self.current_question = self.level_questions[self.q_index]
        self.mode = "question"

    def answer_question(self, choice_index):
        q = self.current_question
        chosen = q["options"][choice_index]
        if chosen == q["answer"]:
            self.begin_feedback(True, "Correct!", q["fact"], "next_q")
        else:
            next_lives = self.lives - 1
            if next_lives <= 0:
                self.begin_feedback(False, "Wrong!", f"Correct answer: {q['answer']}", "game_over")
            else:
                self.begin_feedback(False, "Wrong!", f"Correct answer: {q['answer']}\nLives left: {next_lives}", "next_q")

    def try_portal(self):
        if self.level_coins < self.required_coins:
            need = self.required_coins - self.level_coins
            self.show_message(f"Portal locked: collect {need} more coin(s)!")
            return
        self.q_index = 0
        self.start_next_question()

    def advance_level(self):
        self.level_index += 1
        if self.level_index >= TOTAL_LEVELS:
            self.mode = "win"
            return
        self.load_level(force_camera=True)
        self.mode = "play"

    def draw_world(self):
        self.screen.fill(BG_COLOR)

        for p in self.level["platforms"]:
            pygame.draw.rect(self.screen, PLATFORM_COLOR, self.world_to_screen(p), border_radius=6)

        for c in self.level["coins"]:
            pygame.draw.ellipse(self.screen, COIN_COLOR, self.world_to_screen(c))

        pr = self.world_to_screen(self.level["portal"])
        pygame.draw.rect(self.screen, PORTAL_COLOR, pr, border_radius=10)
        pygame.draw.rect(self.screen, (190, 140, 255), pr.inflate(10, 10), width=3, border_radius=12)

        pygame.draw.rect(self.screen, PLAYER_COLOR, self.world_to_screen(self.player.rect), border_radius=8)

        self.draw_hud()

    def draw_hud(self):
        now = pygame.time.get_ticks()
        hud_font = pygame.font.SysFont("arial", 26, bold=True) if now < self.coin_pop_until else self.font
        hud = hud_font.render(
            f"{self.level['name']} | Coins: {self.level_coins}/{self.required_coins} | Total: {self.total_coins} | Lives: {self.lives}",
            True, TEXT_COLOR
        )
        self.screen.blit(hud, (16, 16))

        hint = self.font.render(
            "Move: A/D or ←/→   Jump: Space/W/↑   Touch portal for quiz   ESC: Quit",
            True, (60, 70, 80)
        )
        self.screen.blit(hint, (16, 42))

        if now < self.msg_until and self.msg:
            msg = self.big.render(self.msg, True, (180, 40, 40))
            self.screen.blit(msg, (WIDTH // 2 - msg.get_width() // 2, 90))

    def draw_start(self):
        self.screen.fill(BG_COLOR)
        title = self.huge.render("Time Travel Platformer + Quiz (4 Levels)", True, TEXT_COLOR)
        self.screen.blit(title, (WIDTH // 2 - title.get_width() // 2, 90))

        lines = [
            "Instructions:",
            "• Move with A/D or Left/Right Arrow",
            "• Jump with Space (or W / Up Arrow)",
            "• Collect ALL coins in the level to unlock the portal",
            "• Touch the portal to start a 4-question quiz",
            "• Answer each question with keys 1 / 2 / 3",
            f"• You have {MAX_LIVES} lives (wrong answers reduce lives)",
            "",
            "Press ENTER to start   |   Press ESC to quit",
        ]
        y = 170
        for line in lines:
            t = self.font.render(line, True, TEXT_COLOR)
            self.screen.blit(t, (WIDTH // 2 - t.get_width() // 2, y))
            y += 28
        pygame.display.flip()

    def draw_question(self):
        self.draw_world()

        card = pygame.Rect(80, 80, WIDTH - 160, HEIGHT - 160)
        pygame.draw.rect(self.screen, OVERLAY_BG, card, border_radius=18)
        pygame.draw.rect(self.screen, (210, 210, 210), card, width=2, border_radius=18)

        q = self.current_question
        lvl = self.level_index + 1
        title = self.big.render(
            f"Level {lvl} Quiz — Q{self.q_index + 1}/{len(self.level_questions)} (Year: {q['year']})",
            True, TEXT_COLOR
        )
        self.screen.blit(title, (card.x + 20, card.y + 18))

        q_lines = wrap_lines(self.font, q["question"], card.w - 40)
        y = card.y + 70
        for line in q_lines:
            self.screen.blit(self.font.render(line, True, TEXT_COLOR), (card.x + 20, y))
            y += 24

        y += 8
        for i, opt in enumerate(q["options"], start=1):
            self.screen.blit(self.font.render(f"{i}) {opt}", True, TEXT_COLOR), (card.x + 20, y))
            y += 30

        hint = self.font.render("Press 1 / 2 / 3 to answer", True, (70, 70, 70))
        self.screen.blit(hint, (card.x + 20, card.bottom - 40))

        pygame.display.flip()

    def draw_feedback(self):
        self.screen.fill(BG_COLOR)

        for p in self.confetti:
            p.update()
            p.draw(self.screen)
        self.confetti = [p for p in self.confetti if p.life > 0 and p.y < HEIGHT + 80]

        color = (20, 120, 40) if self.feedback_good else (180, 40, 40)
        title = self.huge.render(self.feedback_title, True, color)
        self.screen.blit(title, (WIDTH // 2 - title.get_width() // 2, 160))

        lines = wrap_lines(self.font, self.feedback_text, WIDTH - 180)
        y = 240
        for line in lines[:6]:
            t = self.font.render(line, True, TEXT_COLOR)
            self.screen.blit(t, (WIDTH // 2 - t.get_width() // 2, y))
            y += 28

        pygame.display.flip()

    def draw_win(self):
        self.screen.fill(BG_COLOR)
        t = self.huge.render("YOU WIN!", True, (20, 120, 40))
        self.screen.blit(t, (WIDTH // 2 - t.get_width() // 2, 170))

        summary = self.font.render(f"Total Coins Collected: {self.total_coins}", True, TEXT_COLOR)
        self.screen.blit(summary, (WIDTH // 2 - summary.get_width() // 2, 230))

        hint = self.font.render("Press ESC to quit", True, TEXT_COLOR)
        self.screen.blit(hint, (WIDTH // 2 - hint.get_width() // 2, 265))
        pygame.display.flip()

    def draw_game_over(self):
        self.screen.fill(BG_COLOR)
        t = self.huge.render("GAME OVER", True, (180, 40, 40))
        self.screen.blit(t, (WIDTH // 2 - t.get_width() // 2, 170))

        summary = self.font.render("You ran out of lives.", True, TEXT_COLOR)
        self.screen.blit(summary, (WIDTH // 2 - summary.get_width() // 2, 230))

        hint = self.font.render("Press R to restart, or ESC to quit", True, TEXT_COLOR)
        self.screen.blit(hint, (WIDTH // 2 - hint.get_width() // 2, 265))
        pygame.display.flip()

    def run(self):
        while True:
            self.clock.tick(FPS)
            now = pygame.time.get_ticks()

            for e in pygame.event.get():
                if e.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

                if e.type == pygame.KEYDOWN:
                    if e.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()

                    if self.mode == "start":
                        if e.key == pygame.K_RETURN:
                            self.mode = "play"

                    elif self.mode == "play":
                        if e.key in (pygame.K_SPACE, pygame.K_w, pygame.K_UP):
                            self.player.request_jump(now)

                    elif self.mode == "question":
                        if e.key == pygame.K_1:
                            self.answer_question(0)
                        elif e.key == pygame.K_2:
                            self.answer_question(1)
                        elif e.key == pygame.K_3:
                            self.answer_question(2)

                    elif self.mode == "game_over":
                        if e.key == pygame.K_r:
                            self.reset_whole_game()

                if e.type == pygame.KEYUP:
                    if e.key in (pygame.K_SPACE, pygame.K_w, pygame.K_UP):
                        self.player.release_jump()

            if self.mode == "start":
                self.draw_start()
                continue

            if self.mode == "play":
                self.player.update(self.level["platforms"], now)
                self.collect_coins()
                self.update_camera(force=False)

                if now >= self.portal_cooldown_until and self.player.rect.colliderect(self.level["portal"]):
                    self.portal_cooldown_until = now + 400
                    self.try_portal()

                self.draw_world()
                pygame.display.flip()
                continue

            if self.mode == "question":
                self.update_camera(force=False)
                self.draw_question()
                continue

            if self.mode == "feedback":
                self.draw_feedback()
                if now >= self.feedback_until:
                    if self.feedback_next == "next_q":
                        if self.lives <= 0:
                            self.mode = "game_over"
                        else:
                            self.q_index += 1
                            self.start_next_question()
                    elif self.feedback_next == "game_over":
                        self.mode = "game_over"
                continue

            if self.mode == "win":
                self.draw_win()
                continue

            if self.mode == "game_over":
                self.draw_game_over()
                continue


if __name__ == "__main__":
    Game().run()


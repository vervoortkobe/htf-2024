import { A, action, createAsync, useAction } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { getChallenge, upsertUserChallenge as uUc } from "~/api/server";
import { ChallengesMap } from "~/constants";
import NavBar from "./NavBar";
import "./ReactionSpeedChallenge.scss";
import Container from "./Container";

interface BallOptions {
  x?: number;
  y?: number;
  size?: number;
  velocity?: number;
  color?: string;
  angle?: number;
}

interface PaddleOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

class Asteroid {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private size: number;
  private velocity: number;
  private speedMultiplier: number;
  private color: string;
  private angle: number;
  private moveX: number;
  private moveY: number;
  private image: HTMLImageElement;

  constructor(ctx: CanvasRenderingContext2D, options: BallOptions = {}) {
    if (!ctx) throw "Canvas context not provided as first param";
    this.ctx = ctx;
    this.x = options.x || 50;
    this.y = options.y || 50;
    this.size = options.size || 1;
    this.velocity = options.velocity || 51;
    this.speedMultiplier = 1;
    this.color = options.color || "red";
    this.angle = options.angle || 45;
    this.moveX = Math.cos((Math.PI / 180) * this.angle) * this.velocity;
    this.moveY = Math.sin((Math.PI / 180) * this.angle) * this.velocity;

    // Load the asteroid image
    this.image = new Image();
    this.image.src = "/images/custom_asteroid.png";
    this.image.width = this.size / 2;
    this.image.height = this.size / 2;
  }

  getX(): number {
    return this.x;
  }
  getY(): number {
    return this.y;
  }
  getRadius(): number {
    return this.size / 2;
  }
  getMoveX(): number {
    return this.moveX;
  }
  getMoveY(): number {
    return this.moveY;
  }
  setMoveX(val: number): void {
    this.moveX = val;
  }
  setMoveY(val: number): void {
    this.moveY = val;
  }

  increaseSpeed(): void {
    this.speedMultiplier += 0.001;
    this.moveX =
      Math.sign(this.moveX) * Math.abs(this.moveX) * this.speedMultiplier;
    this.moveY =
      Math.sign(this.moveY) * Math.abs(this.moveY) * this.speedMultiplier;
  }

  draw(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(performance.now() / 1000); // Rotate the asteroid over time
    this.ctx.drawImage(
      this.image,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    this.ctx.restore();
  }

  update(canvasWidth: number, canvasHeight: number): void {
    if (this.x + this.size / 2 >= canvasWidth || this.x - this.size / 2 < 0) {
      this.moveX *= -1;
    }
    if (this.y + this.size / 2 >= canvasHeight || this.y - this.size / 2 < 0) {
      this.moveY *= -1;
    }
    this.x += this.moveX;
    this.y += this.moveY;
  }
}

class Paddle {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private color: string;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, options: PaddleOptions = {}) {
    if (!ctx) throw "Canvas context not provided as first param";
    this.ctx = ctx;
    this.x = options.x || 50;
    this.y = 100;
    this.width = options.width || 10;
    this.height = options.height || 100;
    this.color = options.color || "red";
  }

  getX(): number {
    return this.x;
  }
  getY(): number {
    return this.y;
  }
  getHeight(): number {
    return this.height;
  }
  getWidth(): number {
    return this.width;
  }
  setY(y: number): void {
    this.y = y;
  }

  draw(): void {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }
}

export const upsertUserChallenge = action(uUc, "upsertUserChallenge");

const PongChallenge = () => {
  const submit = useAction(upsertUserChallenge);
  const challenge = createAsync(() =>
    getChallenge(ChallengesMap.pongChallenge)
  );
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement | null>(null);
  const [asteroid, setAsteroid] = createSignal<Asteroid | null>(null);
  const [paddle, setPaddle] = createSignal<Paddle | null>(null);
  const [animationFrame, setAnimationFrame] = createSignal<number | null>(null);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(60);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);

  const clear = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = "rgba(0, 0, 0, .2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const resize = () => {
    const currentCanvas = canvas();
    if (currentCanvas) {
      currentCanvas.width = window.innerWidth;
      currentCanvas.height = window.innerHeight;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const currentPaddle = paddle();
    if (currentPaddle) {
      currentPaddle.setY(e.clientY);
    }
  };

  createEffect(() => {
    if (!isStarted() || gameOver()) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          submit(ChallengesMap.pongChallenge, score());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    onCleanup(() => clearInterval(timerInterval));
  });

  createEffect(() => {
    if (!isStarted() || gameOver()) return;

    const currentCanvas = canvas();
    if (!currentCanvas) return;

    const ctx = currentCanvas.getContext("2d");
    if (!ctx) return;

    resize();

    setPaddle(
      new Paddle(ctx, {
        x: 200,
        width: 5,
        height: 100,
        color: "red",
      })
    );

    setAsteroid(
      new Asteroid(ctx, {
        x: currentCanvas.width / 2,
        y: currentCanvas.height / 2,
        size: 50,
        velocity: 15,
        color: "pink",
        angle: 45,
      })
    );

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const frame = requestAnimationFrame(animate);
    setAnimationFrame(frame);

    onCleanup(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrame()) {
        cancelAnimationFrame(animationFrame()!);
      }
    });
  });

  const incrementScore = () => {
    setScore((prev) => prev + 1);
  };

  const animate = () => {
    const currentCanvas = canvas();
    const currentAsteroid = asteroid();
    const currentPaddle = paddle();

    if (!currentCanvas || !currentAsteroid || !currentPaddle || gameOver())
      return;

    const ctx = currentCanvas.getContext("2d");
    if (!ctx) return;

    clear(ctx, currentCanvas);
    currentAsteroid.draw();
    currentAsteroid.update(currentCanvas.width, currentCanvas.height);
    currentPaddle.draw();

    // Collision detection
    if (
      currentPaddle.getX() + currentPaddle.getWidth() >=
        currentAsteroid.getX() - currentAsteroid.getRadius() &&
      currentAsteroid.getY() >= currentPaddle.getY() &&
      currentAsteroid.getY() + currentAsteroid.getRadius() <=
        currentPaddle.getY() + currentPaddle.getHeight()
    ) {
      currentAsteroid.setMoveX(currentAsteroid.getMoveX() * -1);
      currentAsteroid.setMoveY(currentAsteroid.getMoveY() * -1);
      currentAsteroid.increaseSpeed(); // Increase speed on paddle hit
      incrementScore();
    }

    const frame = requestAnimationFrame(animate);
    setAnimationFrame(frame);
  };

  return (
    <div>
      {isStarted() ? (
        <div class="game-container">
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
          {!gameOver() ? (
            <>
              <div class="score-card">
                <p>Score: {score()}</p>
                <p>Time Left: {timeLeft()}s</p>
              </div>
              <div class="game-area">
                <canvas
                  ref={setCanvas}
                  style={{ "background-color": "black" }}
                />
              </div>
            </>
          ) : (
            <div class="result">
              <h2>Time is up! Your Score: {score()}</h2>
              <A href="/">
                <button>Return home</button>
              </A>
            </div>
          )}
        </div>
      ) : (
        <div class="intro-container">
          <NavBar />
          <Container>
            <h1>{challenge()?.[0].challengeName}</h1>
            <p>{challenge()?.[0].challengeDescription}</p>
            <button type="button" onClick={() => setIsStarted(true)}>
              Start
            </button>
          </Container>
        </div>
      )}
    </div>
  );
};

export default PongChallenge;

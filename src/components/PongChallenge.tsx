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
  radius?: number;
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

class Ball {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private radius: number;
  private velocity: number;
  private color: string;
  private angle: number;
  private moveX: number;
  private moveY: number;

  constructor(ctx: CanvasRenderingContext2D, options: BallOptions = {}) {
    if (!ctx) throw "Canvas context not provided as first param";
    this.ctx = ctx;
    this.x = options.x || 50;
    this.y = options.y || 50;
    this.radius = options.radius || 50;
    this.velocity = options.velocity || 51;
    this.color = options.color || "red";
    this.angle = options.angle || 45;
    this.moveX = Math.cos((Math.PI / 180) * this.angle) * this.velocity;
    this.moveY = Math.sin((Math.PI / 180) * this.angle) * this.velocity;
  }

  getX(): number {
    return this.x;
  }
  getY(): number {
    return this.y;
  }
  getRadius(): number {
    return this.radius;
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

  draw(): void {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  update(canvasWidth: number, canvasHeight: number): void {
    if (this.x + this.radius >= canvasWidth || this.x < this.radius) {
      this.moveX *= -1;
    }
    if (this.y + this.radius >= canvasHeight || this.y < this.radius) {
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
  const [ball, setBall] = createSignal<Ball | null>(null);
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

    // Initialize game objects
    setPaddle(
      new Paddle(ctx, {
        x: 100,
        width: 5,
        height: 100,
        color: "green",
      })
    );

    setBall(
      new Ball(ctx, {
        x: currentCanvas.width / 2,
        y: currentCanvas.height / 2,
        radius: 10,
        velocity: 10,
        color: "pink",
        angle: 45,
      })
    );

    // Set up event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    onCleanup(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    });
  });

  const incrementScore = () => {
    setScore((prev) => prev + 1);
  };

  const animate = () => {
    const currentCanvas = canvas();
    const currentBall = ball();
    const currentPaddle = paddle();

    if (!currentCanvas || !currentBall || !currentPaddle || gameOver()) return;

    const ctx = currentCanvas.getContext("2d");
    if (!ctx) return;

    clear(ctx, currentCanvas);
    currentBall.draw();
    currentBall.update(currentCanvas.width, currentCanvas.height);
    currentPaddle.draw();

    // Collision detection
    if (
      currentPaddle.getX() + currentPaddle.getWidth() >=
        currentBall.getX() - currentBall.getRadius() &&
      currentBall.getY() >= currentPaddle.getY() &&
      currentBall.getY() + currentBall.getRadius() <=
        currentPaddle.getY() + currentPaddle.getHeight()
    ) {
      currentBall.setMoveX(currentBall.getMoveX() * -1);
      currentBall.setMoveY(currentBall.getMoveY() * -1);
      incrementScore();
    }

    const frame = requestAnimationFrame(animate);
    setAnimationFrame(frame);
  };

  return (
    <div>
      {isStarted() ? (
        <div class="game-container">
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

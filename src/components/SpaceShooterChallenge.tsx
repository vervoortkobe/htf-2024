import { A, action, createAsync, useAction } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { getChallenge, upsertUserChallenge as uUc } from "~/api/server";
import { ChallengesMap } from "~/constants";
import NavBar from "./NavBar";
import "./SpaceShooterChallenge.scss";
import Container from "./Container";
import spaceshipSvg from "/images/spaceship.svg";
import asteroidSvg from "/images/asteroid.svg";

type Position = {
  top: number;
  left: number;
};

type AsteroidType = {
  id: number;
  position: Position;
  size: number;
  velocity: number;
};

type BulletType = {
  id: number;
  position: Position;
};

export const upsertUserChallenge = action(uUc, "upsertUserChallenge");

const SpaceShooterChallenge = () => {
  const submit = useAction(upsertUserChallenge);
  const challenge = createAsync(() =>
    getChallenge(ChallengesMap.spaceShooterChallenge)
  );

  const [playerPosition, setPlayerPosition] = createSignal<Position>({
    top: 80,
    left: 45,
  });
  const [asteroids, setAsteroids] = createSignal<AsteroidType[]>([]);
  const [bullets, setBullets] = createSignal<BulletType[]>([]);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(60);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);
  const [speedMultiplier, setSpeedMultiplier] = createSignal(1);
  const [lastTime, setLastTime] = createSignal(Date.now());

  let gameAreaRef: HTMLDivElement | null = null;

  // Handle mouse movement to control the player
  const handleMouseMove = (e: MouseEvent) => {
    if (!isStarted()) return;

    const rect = gameAreaRef?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      // Keep vertical position fixed at 80
      setPlayerPosition({ top: 80, left: Math.min(Math.max(x, 0), 90) });
    }
  };

  // Handle shooting bullets
  const shootBullet = () => {
    if (gameOver() || !isStarted()) return;

    const bulletId = Math.random();
    setBullets((prev) => [
      ...prev,
      {
        id: bulletId,
        position: { ...playerPosition(), top: playerPosition().top - 5 },
      },
    ]);
  };

  // Spawn asteroids at random positions
  const spawnAsteroid = () => {
    const asteroidId = Math.random();
    setAsteroids((prev) => [
      ...prev,
      {
        id: asteroidId,
        position: { top: -10, left: Math.random() * 90 },
        size: 12 + Math.random() * 4, // Visual size 12-16vh
        velocity: 0.2 + Math.random() * speedMultiplier(),
      },
    ]);
  };

  // Check for collisions between bullets and asteroids, and player and asteroids
  const checkCollisions = () => {
    // Check bullet-asteroid collisions
    const updatedAsteroids = asteroids().filter((asteroid) => {
      const hit = bullets().some((bullet) => {
        const dx = asteroid.position.left - bullet.position.left;
        const dy = asteroid.position.top - bullet.position.top;
        const hitboxSize = asteroid.size * 0.275; // Adjusted hitbox to 27.5% of visual size
        return Math.sqrt(dx * dx + dy * dy) < hitboxSize;
      });

      if (hit) setScore((prev) => prev + 1);
      return !hit;
    });

    // Check player-asteroid collisions
    const playerHit = updatedAsteroids.some((asteroid) => {
      const dx = asteroid.position.left - playerPosition().left;
      const dy = asteroid.position.top - playerPosition().top;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitboxSize = asteroid.size * 0.275; // Adjusted hitbox to 27.5% of visual size
      return distance < (hitboxSize + 1.25); // asteroid hitbox + player radius
    });

    if (playerHit) {
      setGameOver(true);
      submit(ChallengesMap.spaceShooterChallenge, score());
    }

    const updatedBullets = bullets().filter(
      (bullet) => bullet.position.top > 0
    );

    setAsteroids(updatedAsteroids);
    setBullets(updatedBullets);
  };

  // Update positions of bullets and asteroids
  const updatePositions = () => {
    setBullets((prev) =>
      prev.map((bullet) => ({
        ...bullet,
        position: { ...bullet.position, top: bullet.position.top - 1 },
      }))
    );

    setAsteroids((prev) =>
      prev.map((asteroid) => ({
        ...asteroid,
        position: {
          ...asteroid.position,
          top: asteroid.position.top + asteroid.velocity * 0.5,
        },
      }))
    );
  };

  createEffect(() => {
    if (!isStarted() || gameOver()) return;

    const gameInterval = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime()) / 1000; // Convert to seconds
      setLastTime(currentTime);

      updatePositions();
      checkCollisions();

      // Update time left
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - deltaTime);
        if (newTime <= 0) {
          setGameOver(true);
          submit(ChallengesMap.spaceShooterChallenge, score());
          clearInterval(gameInterval);
          return 0;
        }
        return newTime;
      });

      if (Math.random() < 0.05) spawnAsteroid();
    }, 16);

    onCleanup(() => clearInterval(gameInterval));
  });

  return (
    <div>
      {isStarted() ? (
        <div
          class={`game-container ${!gameOver() ? 'playing' : ''}`}
        >
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
          <div
            ref={(el) => (gameAreaRef = el)}
            onMouseMove={handleMouseMove}
            onClick={shootBullet}
            class="game-area"
          >
            {!gameOver() ? (
              <>
                <div class="score-card">
                  <p>Score: {score()}</p>
                  <p>Time Left: {timeLeft().toFixed(0)}s</p>
                </div>
                <div class="game-area">
                  {/* Player */}
                  <div
                    class="player"
                    style={{
                      top: `${playerPosition().top}vh`,
                      left: `${playerPosition().left}vw`,
                    }}
                  >
                    <img src={spaceshipSvg} alt="spaceship" />
                  </div>
                  {/* Bullets */}
                  {bullets().map((bullet) => (
                    <div
                      id={bullet.id.toString()}
                      class="bullet"
                      style={{
                        top: `${bullet.position.top}vh`,
                        left: `${bullet.position.left}vw`,
                      }}
                    />
                  ))}
                  {/* Asteroids */}
                  {asteroids().map((asteroid) => (
                    <div
                      id={asteroid.id.toString()}
                      class="asteroid"
                      style={{
                        top: `${asteroid.position.top}vh`,
                        left: `${asteroid.position.left}vw`,
                        width: `${asteroid.size}vh`,
                        height: `${asteroid.size}vh`,
                      }}
                    >
                      <img src={asteroidSvg} alt="asteroid" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div class="result">
                <h2>Game Over! Your Score: {score()}</h2>
                <A href="/">
                  <button>Return Home</button>
                </A>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div class="intro-container">
          <NavBar />
          <Container>
            <h1>{challenge()?.[0].challengeName}</h1>
            <p>{challenge()?.[0].challengeDescription}</p>
            <button onClick={() => setIsStarted(true)}>Start Game</button>
          </Container>
        </div>
      )}
    </div>
  );
};

export default SpaceShooterChallenge;

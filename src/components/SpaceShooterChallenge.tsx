import { A, action, createAsync, useAction } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { getChallenge, upsertUserChallenge as uUc } from "~/api/server";
import { ChallengesMap } from "~/constants";
import NavBar from "./NavBar";

import Container from "./Container";

type Position = {
  top: number;
  left: number;
};

type AsteroidProps = {
  position: Position;
};

type BulletProps = {
  position: Position;
};

export const upsertUserChallenge = action(uUc, "upsertUserChallenge");

const Asteroid = ({ position }: AsteroidProps) => (
  <div
    class="asteroid"
    style={{ left: `${position.left}vw`, top: `${position.top}vh` }}
  />
);

const Bullet = ({ position }: BulletProps) => (
  <div
    class="bullet"
    style={{
      left: `${position.left}vw`,
      top: `${position.top}vh`,
    }}
  />
);

const SpaceShooterChallenge = () => {
  const submit = useAction(upsertUserChallenge);
  const challenge = createAsync(() =>
    getChallenge(ChallengesMap.spaceShooterChallenge)
  );

  const [playerPosition, setPlayerPosition] = createSignal<Position>({
    top: 80,
    left: 45,
  });
  const [asteroids, setAsteroids] = createSignal<
    { id: number; position: Position }[]
  >([]);
  const [bullets, setBullets] = createSignal<
    { id: number; position: Position }[]
  >([]);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(30);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);

  // Move the player with keyboard
  const handleKeydown = (e: KeyboardEvent) => {
    if (gameOver() || !isStarted()) return;
    setPlayerPosition((prev) => {
      if (e.key === "ArrowLeft")
        return { ...prev, left: Math.max(prev.left - 5, 0) };
      if (e.key === "ArrowRight")
        return { ...prev, left: Math.min(prev.left + 5, 90) };
      if (e.key === "ArrowUp")
        return { ...prev, top: Math.max(prev.top - 5, 0) };
      if (e.key === "ArrowDown")
        return { ...prev, top: Math.min(prev.top + 5, 90) };
      return prev;
    });
    if (e.key === " ") {
      // Shoot bullet
      const bulletId = Math.random();
      setBullets((prev) => [
        ...prev,
        {
          id: bulletId,
          position: { ...playerPosition(), top: playerPosition().top - 5 },
        },
      ]);
    }
  };

  // Generate falling asteroids
  const generateAsteroid = () => {
    if (!gameOver()) {
      const asteroidId = Math.random();
      setAsteroids((prev) => [
        ...prev,
        {
          id: asteroidId,
          position: { left: Math.random() * 90, top: 0 },
        },
      ]);
    }
  };

  // Move asteroids and bullets
  createEffect(() => {
    if (isStarted() && !gameOver()) {
      const gameInterval = setInterval(() => {
        setAsteroids((prev) =>
          prev
            .map((asteroid) => ({
              ...asteroid,
              position: {
                ...asteroid.position,
                top: asteroid.position.top + 3,
              },
            }))
            .filter((asteroid) => asteroid.position.top <= 100)
        );
        setBullets((prev) =>
          prev
            .map((bullet) => ({
              ...bullet,
              position: { ...bullet.position, top: bullet.position.top - 5 },
            }))
            .filter((bullet) => bullet.position.top >= 0)
        );
        // Check collisions
        checkCollisions();
      }, 100);

      const asteroidSpawn = setInterval(generateAsteroid, 1000);

      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            clearInterval(gameInterval);
            clearInterval(asteroidSpawn);
            clearInterval(timerInterval);
            submit(ChallengesMap.spaceShooterChallenge, score());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      onCleanup(() => {
        clearInterval(gameInterval);
        clearInterval(asteroidSpawn);
        clearInterval(timerInterval);
      });
    }
  });

  // Handle collisions
  const checkCollisions = () => {
    setAsteroids((prevAsteroids) =>
      prevAsteroids.filter((asteroid) => {
        const hit = bullets().some(
          (bullet) =>
            bullet.position.top <= asteroid.position.top + 5 &&
            bullet.position.top + 5 >= asteroid.position.top &&
            bullet.position.left >= asteroid.position.left &&
            bullet.position.left <= asteroid.position.left + 5
        );
        if (hit) {
          setScore(score() + 1);
          setBullets((prevBullets) =>
            prevBullets.filter(
              (bullet) =>
                bullet.position.top < asteroid.position.top - 5 ||
                bullet.position.left < asteroid.position.left - 5 ||
                bullet.position.left > asteroid.position.left + 5
            )
          );
        }
        return !hit;
      })
    );
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
              <div
                class="game-area"
                tabIndex={0}
                onKeyDown={handleKeydown}
                style={{ outline: "none" }}
              >
                <div
                  class="player"
                  style={{
                    left: `${playerPosition().left}vw`,
                    top: `${playerPosition().top}vh`,
                  }}
                ></div>
                {bullets().map((bullet) => (
                  <Bullet position={bullet.position} />
                ))}
                {asteroids().map((asteroid) => (
                  <Asteroid position={asteroid.position} />
                ))}
              </div>
            </>
          ) : (
            <div class="result">
              <h2>Game Over! Your Score: {score()}</h2>
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

export default SpaceShooterChallenge;

import { A, action, createAsync, useAction } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { getChallenge, upsertUserChallenge as uUc } from "~/api/server";
import { ChallengesMap } from "~/constants";
import NavBar from "./NavBar";
import "./ReactionSpeedChallenge.scss";
import Container from "./Container";

type Position = {
  top: number;
  left: number;
};

type AsteroidProps = {
  position: Position;
  onClick: () => void;
};

export const upsertUserChallenge = action(uUc, "upsertUserChallenge");

const Asteroid = ({ position, onClick }: AsteroidProps) => {
  return (
    <div
      class="asteroid"
      style={{ left: `${position.left}vw`, top: `${position.top}vh` }}
      onClick={onClick}
    />
  );
};

const ReactionSpeedChallenge = () => {
  const submit = useAction(upsertUserChallenge);
  const challenge = createAsync(() =>
    getChallenge(ChallengesMap.reactionSpeedChallenge)
  );
  const [asteroid, setAsteroid] = createSignal<{
    id: number;
    position: Position;
  } | null>(null);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(30);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);

  const generateAsteroid = () => {
    if (!gameOver()) {
      const asteroidId = Math.random();
      setAsteroid({
        id: asteroidId,
        position: { left: Math.random() * 90, top: Math.random() * 80 },
      });
    }
  };

  createEffect(() => {
    if (isStarted() && !gameOver()) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            clearInterval(timerInterval);
            submit(ChallengesMap.reactionSpeedChallenge, score());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      onCleanup(() => {
        clearInterval(timerInterval);
      });

      generateAsteroid();
    }
  });

  const handleAsteroidClick = (id: number) => {
    if (asteroid() && asteroid()?.id === id) {
      setAsteroid(null);
      setScore(score() + 1);
      generateAsteroid();
    }
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
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
                {asteroid() && (
                  <Asteroid
                    position={asteroid()!.position}
                    onClick={() => handleAsteroidClick(asteroid()!.id)}
                  />
                )}
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

export default ReactionSpeedChallenge;

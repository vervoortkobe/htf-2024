import { action, createAsync, useAction } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { getChallenge, upsertUserChallenge as uUc } from "~/api/server";
import { ChallengesMap } from "~/constants";
import NavBar from "./NavBar";
import "./ReactionSpeedChallenge.css";

type Position = {
  top: number;
  left: number;
};

type BallProps = {
  position: Position;
  onClick: () => void;
};

export const upsertUserChallenge = action(uUc, "upsertUserChallenge");

const Ball = ({ position, onClick }: BallProps) => {
  return (
    <div
      class="ball"
      style={{ left: `${position.left}vw`, top: `${position.top}vh` }}
      onClick={onClick}
    ></div>
  );
};

const ReactionSpeedChallenge = () => {
  const submit = useAction(upsertUserChallenge);
  const challenge = createAsync(() =>
    getChallenge(ChallengesMap.reactionSpeedChallenge)
  );
  const [ball, setBall] = createSignal<{
    id: number;
    position: Position;
  } | null>(null);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(30);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);

  const generateBall = () => {
    if (!gameOver()) {
      const ballId = Math.random();
      setBall({
        id: ballId,
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

      generateBall();
    }
  });

  const handleBallClick = (id: number) => {
    if (ball() && ball()?.id === id) {
      setBall(null);
      setScore(score() + 1);
      generateBall();
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
                {ball() && (
                  <Ball
                    position={ball()!.position}
                    onClick={() => handleBallClick(ball()!.id)}
                  />
                )}
              </div>
            </>
          ) : (
            <h2>Game Over! Your Score: {score()}</h2>
          )}
        </div>
      ) : (
        <div class="intro-container">
          <NavBar />
          <h1>{challenge()?.[0].challengeName}</h1>
          <p>{challenge()?.[0].challengeDescription}</p>
          <button type="button" onClick={() => setIsStarted(true)}>
            Start
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionSpeedChallenge;

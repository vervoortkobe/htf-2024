# Step-by-Step Guide

## Step 1: Create the Ball Component

The first step is to create a reusable Ball component that represents the ball the user will click on. This component takes two props: position and onClick.

```typescript
type Position = {
  top: number;
  left: number;
};

type BallProps = {
  position: Position;
  onClick: () => void;
};

const Ball = ({ position, onClick }: BallProps) => {
  return (
    <div
      class="ball"
      style={{ left: `${position.left}vw`, top: `${position.top}vh` }}
      onClick={onClick}
    ></div>
  );
};
```

Why?: We encapsulate the ball logic in its own component to keep our code modular and reusable. The Ball component will handle positioning itself on the screen and responding to clicks.

## Step 2: Set Up the Game State in ReactionSpeedChallenge

Next, we set up the core game logic in the ReactionSpeedChallenge component. We'll use createSignal to manage state for the ball's position, score, remaining time, game over status, and game start status.

```typescript
const ReactionSpeedChallenge=()=> {
  const [ball, setBall] = createSignal<{
    id: number;
    position: Position;
  } | null>(null);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(30);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);
```

Why?: We need these state variables to control the game's flow—keeping track of the current ball's position, the player's score, how much time is left, whether the game is over, and whether the game has started.

## Step 3: Generate a Random Ball

```typescript
const generateBall = () => {
  if (!gameOver()) {
    const ballId = Math.random();
    setBall({
      id: ballId,
      position: { left: Math.random() * 90, top: Math.random() * 80 },
    });
  }
};
```

Why?: This function generates a new ball at a random position on the screen when called, provided the game isn't over.

## Step 4: Implement the Game Timer

We use createEffect to handle the countdown timer and the game's lifecycle.

```typescript
createEffect(() => {
  if (isStarted() && !gameOver()) {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          clearInterval(timerInterval);
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
```

Why?: createEffect runs whenever the isStarted or gameOver signals change. It starts a timer that counts down every second, and when the time is up, it stops the game. We also clean up the timer using onCleanup to prevent memory leaks.

## Step 5: Handle Ball Clicks

We create a function handleBallClick that handles when the user clicks on a ball.

```typescript
const handleBallClick = (id: number) => {
  if (ball() && ball()?.id === id) {
    setBall(null);
    setScore(score() + 1);
    generateBall();
  }
};
```

Why?: When a ball is clicked, we check if it's the currently active ball (by comparing IDs). If so, we increment the score, remove the current ball, and generate a new one.

## Step 6: Render the Game UI

Finally, we render the UI based on the current game state.

```typescript
return (
  <div class="container">
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
      <>
        <h1>Reaction Speed Challenge</h1>
        <p>Welcome to the Reaction Speed Challenge...</p>
        <button type="button" onClick={() => setIsStarted(true)}>
          Start
        </button>
      </>
    )}
  </div>
);
```

Why?: Depending on the game state, we either show the start screen, the active game screen, or the game-over screen.

## Step 7: Style the Game

Add the necessary CSS to style the game (ReactionSpeedChallenge.css)

```css
.game-area {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  background-image: wheat;
}

.ball {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: #3498db;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.5s ease;
  z-index: 50;
}

h1 {
  font-size: 2em;
}

p {
  font-size: 1.5em;
}

h2 {
  color: #e74c3c;
}

button {
  width: fit-content;
}

.game-container {
  position: relative;
  height: 100%;
}

.score-card {
  z-index: 20;
  position: absolute;
  top: 0px;
  left: 10px;
  border: 1px solid black;
  padding: 8px;
  border-radius: 1rem;
}

.intro-container{
  display: flex;
  flex-direction: column;
  height: 100%;
}

```

## Step 8: Utilize the component

Use the component in the route 'reaction-speed-challenge'

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

## Step 3: Fetch the challenge from the backend

```typescript
export async function getChallenge(challengeId: number) {
  const user = await getUser();
  return db
    .select({
      challengeId: Challenges.id,
      challengeName: Challenges.name,
      challengeDescription: Challenges.description,
      userChallengeId: UserChallenges.challengeId,
      score: UserChallenges.score,
    })
    .from(Challenges)
    .leftJoin(
      UserChallenges,
      and(
        eq(Challenges.id, UserChallenges.challengeId),
        eq(UserChallenges.userId, user.id)
      )
    )
    .where(eq(Challenges.id, challengeId))
    .limit(1);
}
```

```typescript
const challenge = createAsync(() =>
  getChallenge(ChallengesMap.reactionSpeedChallenge)
);
```

Why?: Fetching the challenge data from the backend ensures that we have the most up-to-date information for the challenge. By using createAsync, we can handle the asynchronous nature of network requests and manage the loading and error states effectively, ensuring a smooth user experience.

## Step 4: Generate a Random Ball

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

## Step 5: Implement the Game Timer

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

## Step 6: Handle Ball Clicks

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

## Step 7: Render the Game UI

Finally, we render the UI based on the current game state.

```jsx
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
          <h2>Time is up! Your Score: {score()}</h2>
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
```

Why?: Depending on the game state, we either show the start screen, the active game screen, or the game-over screen.

## Step 8: Style the Game

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

.intro-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
```

## Step 9: Utilize the component

Use the component in the route 'reaction-speed-challenge'

## Step 10: Time to test

Once you’ve set up all the components and styles, it’s time to test the game. Click the "Start" button to begin the challenge. Try to click on the balls as quickly as possible to score points before the timer runs out. Ensure that the balls appear in random positions, the timer counts down correctly, and the game transitions smoothly between active and game-over states.

## Step 11: Save the score in the backend

To persist the player’s score, you’ll need to save it to the backend once the game ends. This step ensures that the score is not lost when the page is refreshed or the player navigates away.

```typescript
export async function upsertUserChallenge(challengeId: number, score: number) {
  const user = await getUser();
  await db
    .insert(UserChallenges)
    .values({ userId: user.id, challengeId, score })
    .onConflictDoUpdate({
      target: [UserChallenges.userId, UserChallenges.challengeId],
      set: { score },
    });
}
```

The upsertUserChallenge function inserts a new record into the UserChallenges table or updates an existing record if a conflict occurs on the combination of userId and challengeId. It ensures that the user's score for a specific challenge is either created or updated with the latest score value.

```typescript
export const upsertUserChallenge = action(uUc, "upsertUserChallenge");
```

Read more about [actions](https://docs.solidjs.com/solid-router/concepts/actions)

```typescript
const submit = useAction(upsertUserChallenge);
```

```typescript
submit(ChallengesMap.reactionSpeedChallenge, score());
```

This will send the final score to the backend, updating the user's challenge record.
Ensure you call this function as part of the game-over logic

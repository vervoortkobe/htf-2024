# Step-by-Step Guide

## Step 1: Create the Asteroid Component

The first step is to create a reusable Asteroid component that represents the asteroid the user will click on. This component takes two props: position and onClick.

```typescript
type Position = {
  top: number;
  left: number;
};

type AsteroidProps = {
  position: Position;
  onClick: () => void;
};

const Asteroid = ({ position, onClick }: AsteroidProps) => {
  return (
    <div
      class="asteroid"
      style={{ left: `${position.left}vw`, top: `${position.top}vh` }}
      onClick={onClick}
    ></div>
  );
};
```

Why?: We encapsulate the asteroid logic in its own component to keep our code modular and reusable. The Asteroid component will handle positioning itself on the screen and responding to clicks.

## Step 2: Set Up the Game State in ReactionSpeedChallenge

Next, we set up the core game logic in the ReactionSpeedChallenge component. We'll use createSignal to manage state for the asteroid's position, score, remaining time, game over status, and game start status.

```typescript
const ReactionSpeedChallenge=()=> {
  const [asteroid, setAsteroid] = createSignal<{
    id: number;
    position: Position;
  } | null>(null);
  const [score, setScore] = createSignal(0);
  const [timeLeft, setTimeLeft] = createSignal(30);
  const [gameOver, setGameOver] = createSignal(false);
  const [isStarted, setIsStarted] = createSignal(false);
```

Why?: We need these state variables to control the game's flow—keeping track of the current asteroid's position, the player's score, how much time is left, whether the game is over, and whether the game has started.

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

## Step 4: Generate a Random Asteroid

```typescript
const generateAsteroid = () => {
  if (!gameOver()) {
    const asteroidId = Math.random();
    setAsteroid({
      id: asteroidId,
      position: { left: Math.random() * 90, top: Math.random() * 80 },
    });
  }
};
```

Why?: This function generates a new asteroid at a random position on the screen when called, provided the game isn't over.

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

    generateAsteroid();
  }
});
```

Why?: createEffect runs whenever the isStarted or gameOver signals change. It starts a timer that counts down every second, and when the time is up, it stops the game. We also clean up the timer using onCleanup to prevent memory leaks.

## Step 6: Handle Asteroid Clicks

We create a function handleAsteroidClick that handles when the user clicks on a asteroid.

```typescript
const handleAsteroidClick = (id: number) => {
  if (asteroid() && asteroid()?.id === id) {
    setAsteroid(null);
    setScore(score() + 1);
    generateAsteroid();
  }
};
```

Why?: When a asteroid is clicked, we check if it's the currently active asteroid (by comparing IDs). If so, we increment the score, remove the current asteroid, and generate a new one.

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
        <h2>Time is up! Your Score: {score()}</h2>
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
```

Why?: Depending on the game state, we either show the start screen, the active game screen, or the game-over screen.

## Step 8: Style the Game

Add the necessary CSS to style the game (ReactionSpeedChallenge.scss)

```scss
@function multiple-box-shadow($n) {
  $value: "#{random(2000)}px #{random(2000)}px #FFF";
  @for $i from 2 through $n {
    $value: "#{$value}, #{random(2000)}px #{random(2000)}px #FFF";
  }
  @return unquote($value);
}

$shadows-small: multiple-box-shadow(700);
$shadows-medium: multiple-box-shadow(200);
$shadows-big: multiple-box-shadow(100);

@mixin star-style($size, $shadow, $animation-duration) {
  width: $size;
  height: $size;
  background: transparent;
  box-shadow: $shadow;
  animation: animStar $animation-duration linear infinite;

  &:after {
    content: " ";
    position: absolute;
    top: 2000px;
    width: $size;
    height: $size;
    background: transparent;
    box-shadow: $shadow;
  }
}

#title {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  color: #fff;
  text-align: center;
  font-family: "Lato", sans-serif;
  font-weight: 300;
  font-size: 50px;
  letter-spacing: 10px;
  margin-top: -60px;
  padding-left: 10px;

  span {
    background: -webkit-linear-gradient(white, #38495a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

// Keyframes for star animation
@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
}

.game-area {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: black;
}

.asteroid {
  position: absolute;
  width: 50px;
  height: 50px;
  background-image: url(/images/asteroid.svg);
  cursor: pointer;
  transition: all 0.5s ease;
  z-index: 50;
}

h1 {
  font-size: 2em;
}

h2 {
  text-align: center;
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

#stars {
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: $shadows-small;
  animation: animStar 50s linear infinite;
}
#stars:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: $shadows-small;
}

#stars2 {
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: $shadows-medium;
  animation: animStar 100s linear infinite;
}
#stars2:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: $shadows-medium;
}

#stars3 {
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: $shadows-big;
  animation: animStar 150s linear infinite;
}
#stars3:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: $shadows-big;
}

#title {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  color: #fff;
  text-align: center;
  font-family: "lato", sans-serif;
  font-weight: 300;
  font-size: 50px;
  letter-spacing: 10px;
  margin-top: -60px;
  padding-left: 10px;
}
#title span {
  background: -webkit-linear-gradient(white, #38495a);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
}
```

## Step 9: Utilize the component

Use the component in the route 'reaction-speed-challenge'

## Step 10: Time to test

Once you’ve set up all the components and styles, it’s time to test the game. Click the "Start" button to begin the challenge. Try to click on the asteroids as quickly as possible to score points before the timer runs out. Ensure that the asteroids appear in random positions, the timer counts down correctly, and the game transitions smoothly between active and game-over states.

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

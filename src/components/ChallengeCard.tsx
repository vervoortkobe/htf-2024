import "./ChallengeCard.css";

type ChallengeCardProps = {
  challenge: {
    name: string;
    description: string;
    completed?: number;
  };
};

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  return (
    <div class="challengeCard">
      <h3>{challenge.name}</h3>
      {challenge.completed ? (
        <div class="completion-badge">
          <span>Completed</span>
          <div class="score">Score: {challenge.completed}</div>
        </div>
      ) : (
        <div class="incompletion-badge">
          <span>Not Completed</span>
        </div>
      )}
      <p>{challenge.description}</p>
    </div>
  );
};

export default ChallengeCard;
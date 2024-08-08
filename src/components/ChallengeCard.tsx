import { InferSelectModel } from "drizzle-orm";
import { Challenges } from "../../drizzle/schema";
import "./ChallengeCard.css";

type ChallengeCardProps = {
  challenge: InferSelectModel<typeof Challenges>;
};

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  return (
    <div class="challengeCard">
      <h3>{challenge.name}</h3>
      <p>{challenge.description}</p>
    </div>
  );
};

export default ChallengeCard;
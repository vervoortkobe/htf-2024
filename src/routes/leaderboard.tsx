import { createResource, Show, For } from "solid-js";
import { getGlobalLeaderboard, getLeaderboard } from "~/api/server";
import "./leaderboard.scss";
import Container from "~/components/Container";

const LeaderboardTable = (props: {
  data: any[];
  type: "global" | "challenge";
  loading: boolean;
}) => {
  return (
    <div class={`leaderboard-table-container ${props.type}-table`}>
      <Show when={!props.loading} fallback={
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <span>Loading Rankings...</span>
        </div>
      }>
        <table>
          <thead>
            <tr>
              <th class="rank-header">Rank</th>
              <th>Username</th>
              <Show when={props.type === "global"} fallback={
                <>
                  <th>Score</th>
                  <th>Challenge</th>
                </>
              }>
                <th>Total Score</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={props.data}>{(score, index) => (
              <tr class={index() < 3 ? `top-${index() + 1}` : ""}>
                <td class="rank">
                  {index() < 3 ? (
                    <i class={`fas fa-trophy trophy-${index() + 1}`}></i>
                  ) : (
                    index() + 1
                  )}
                </td>
                <td class="username">
                  <i class="fas fa-user-astronaut"></i>
                  {score.username}
                </td>
                <Show when={props.type === "global"} fallback={
                  <>
                    <td class="score">
                      <span class="score-value">{score.score}</span>
                      <span class="score-label">points</span>
                    </td>
                    <td class="challenge-name">
                      <i class="fas fa-rocket"></i>
                      {score.challengeName}
                    </td>
                  </>
                }>
                  <td class="score">
                    <span class="score-value">{score.totalScore}</span>
                    <span class="score-label">points</span>
                  </td>
                </Show>
              </tr>
            )}</For>
          </tbody>
        </table>
      </Show>
      <Show when={props.data && props.data.length === 0} fallback={
        <div class="no-data">No rankings available yet</div>
      }></Show>
    </div>
  );
};

const Leaderboard = () => {
  const [globalData] = createResource(getGlobalLeaderboard);
  const [challengeData] = createResource(getLeaderboard);

  return (
    <div class="leaderboard-page">
      <Container>
        <div class="leaderboard-content">
          <div class="leaderboard-section global">
            <div class="section-header">
              <i class="fas fa-globe"></i>
              <h1>Global Rankings</h1>
            </div>
            <LeaderboardTable
              data={globalData() || []}
              type="global"
              loading={globalData.loading}
            />
          </div>

          <div class="leaderboard-section challenges">
            <div class="section-header">
              <i class="fas fa-flag-checkered"></i>
              <h1>Challenge Rankings</h1>
            </div>
            <LeaderboardTable
              data={challengeData() || []}
              type="challenge"
              loading={challengeData.loading}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Leaderboard;
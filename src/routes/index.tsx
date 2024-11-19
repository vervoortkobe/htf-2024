import { A } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { getChallenges } from "~/api/server";
import ChallengeCard from "~/components/ChallengeCard";
import Container from "~/components/Container";
import NavBar from "~/components/NavBar";
import ParticlesBackground from "~/components/ParticlesBackground";
import { createSignal } from "solid-js";
import "./index.scss";

export default function HomeRoute() {
  const [challenges] = createResource(getChallenges);
  const [searchTerm, setSearchTerm] = createSignal("");

  const filteredChallenges = () => {
    const term = searchTerm().toLowerCase();
    return challenges()?.filter(
      (challenge) => challenge.name.toLowerCase().includes(term)
    );
  };

  return (
    <>
      <ParticlesBackground />
      <NavBar />
      <Container>
        <Show when={challenges()} fallback={
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <span>Loading challenges...</span>
          </div>
        }>
          <div class="search-container">
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
              class="search-input"
            />
          </div>
          <div class="challenges-container">
            <div class="challenges-grid">
              {filteredChallenges()?.map((challenge) => (
                <A href={`/${challenge.name.toLowerCase().replaceAll(" ", "-")}`}>
                  <div class="challenge-wrapper">
                    <div class="challenge-content">
                      <ChallengeCard challenge={challenge} />
                    </div>
                  </div>
                </A>
              ))}
            </div>
          </div>
        </Show>
      </Container>
    </>
  );
}

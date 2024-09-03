import { A } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { getChallenges } from "~/api/server";
import ChallengeCard from "~/components/ChallengeCard";
import Container from "~/components/Container";
import NavBar from "~/components/NavBar";

export default function HomeRoute() {
  const [challenges] = createResource(getChallenges);
  return (
    <>
      <NavBar />
      <Container>
        <Show when={challenges()} fallback={"Loading..."}>
          <div>
            {challenges()?.map((challenge) => (
              <A href="/reaction-speed-challenge">
                <ChallengeCard challenge={challenge} />
              </A>
            ))}
          </div>
        </Show>
      </Container>
    </>
  );
}

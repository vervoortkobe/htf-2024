import { createAsync, type RouteDefinition } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { getUser, logout } from "~/api";
import { getChallenges } from "~/api/server";
import ChallengeCard from "~/components/ChallengeCard";

export default function Home() {
  const user = createAsync(async () => getUser(), { deferStream: true });
  const [challenges] = createResource(getChallenges);
  return (
    <main class="w-full p-4 space-y-2">
      <h2 class="font-bold text-3xl">Hello {user()?.username}</h2>
      <Show when={challenges()} fallback={"Loading..."}>
        <div>
          {challenges()?.map((challenge) => (
            <ChallengeCard challenge={challenge} />
          ))}
        </div>
      </Show>

      <h3 class="font-bold text-xl">Message board</h3>
      <form action={logout} method="post">
        <button name="logout" type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}

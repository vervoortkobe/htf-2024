import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { loginOrRegister } from "~/api";
import Container from "~/components/Container";
import "./login.scss";

export default function LoginRoute(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const [loginType, setLoginType] = createSignal("login");

  return (
    <Container>
      <form action={loginOrRegister} method="post" class="login-form">
        <img
          class="logo-login"
          src="../../logo_htf.webp"
          alt="Space Cadet Program"
        />
        <h1>Space Cadet Program</h1>
        <input
          type="hidden"
          name="redirectTo"
          value={props.params.redirectTo ?? "/"}
        />
        <fieldset>
          <label>
            <input 
              type="radio" 
              name="loginType" 
              value="login" 
              checked={loginType() === "login"} 
              onChange={(e) => setLoginType(e.currentTarget.value)}
            />
            Login
          </label>
          <label>
            <input 
              type="radio" 
              name="loginType" 
              value="register" 
              checked={loginType() === "register"}
              onChange={(e) => setLoginType(e.currentTarget.value)}
            />
            Register
          </label>
        </fieldset>
        <div class="input-container">
          <label for="username">Username</label>
          <input type="text" name="username" autocomplete="username" />
        </div>
        <div class="input-container">
          <label for="password">Password</label>
          <input
            name="password"
            type="password"
            autocomplete="current-password"
          />
        </div>
        <button id="login-button" type="submit">
          {loginType() === "login" ? "Login" : "Register"}
        </button>
        <Show when={loggingIn.result}>
          <p style={{ color: "red" }} role="alert" id="error-message">
            {loggingIn.result!.message}
          </p>
        </Show>
      </form>
    </Container>
  );
}

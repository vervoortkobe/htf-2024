import { getUser, logout } from "~/api";
import "./NavBar.css";
import { A, createAsync } from "@solidjs/router";
import Container from "./Container";

const NavBar = () => {
  const user = createAsync(async () => getUser(), { deferStream: true });

  return (
    <>
      {user() && (
        <div class="nav-wrapper">
          <Container>
            <div class="nav-content">
              <div class="nav-left">
                <A href="/" class="logo-link">
                  <img
                    class="logo"
                    src="../../logo_htf.webp"
                    alt="Space Cadet Program"
                  />
                  <span class="logo-text">Space Cadet</span>
                </A>
              </div>

              <nav class="nav-center">
                <ul>
                  <li>
                    <A href="/" class="nav-link">
                      <i class="fas fa-home"></i>
                      Home
                    </A>
                  </li>
                  <li>
                    <A href="/leaderboard" class="nav-link">
                      <i class="fas fa-trophy"></i>
                      Leaderboard
                    </A>
                  </li>
                </ul>
              </nav>

              <div class="nav-right">
                <div class="user-info">
                  <span class="username">
                    <i class="fas fa-user-astronaut"></i>
                    {user()!.username}
                  </span>
                </div>
                <form action={logout} method="post">
                  <button class="logout-btn" name="logout" type="submit">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default NavBar;

import { getUser, logout } from "~/api";
import "./NavBar.css";
import { createAsync } from "@solidjs/router";

const NavBar = () => {
  const user = createAsync(async () => getUser(), { deferStream: true });
  return (
    <>
      {user() ? (
        <div class="container">
          <img
            class="logo"
            src="../../logo_htf.webp"
            alt="Space Cadet Program"
          />
          Hello {user()!.username} 👋
          <form action={logout} method="post">
            <button name="logout" type="submit">
              Logout
            </button>
          </form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default NavBar;

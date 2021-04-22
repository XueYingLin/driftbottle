import { useAuth0 } from "@auth0/auth0-react";
import './AppTitle.css';

function LoggedInUser({ user, logout }) {
  return <div class="UserProfile"><span className="MenuItemLogOut">Log Out</span><button onClick={() => logout()} class="linkbutton"><img src={user.picture} alt={user.name} /></button></div>
}

function LoggedOutUser({ loginWithRedirect }) {
  return <div class="UserProfile"><button className="SignInButton" onClick={() => loginWithRedirect()}>Sign In</button></div>
}

export function AppTitle() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  return <div>
    <div className="AppTitle">driftbottle</div>
    {
      isLoading ? <span></span> : isAuthenticated ? <LoggedInUser user={user} logout={logout} /> : <LoggedOutUser loginWithRedirect={loginWithRedirect} />
    }
  </div>
}

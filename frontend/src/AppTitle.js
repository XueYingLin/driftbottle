import { useAuth0 } from "@auth0/auth0-react";
import { useState } from 'react';
import './AppTitle.css';

function LoggedInUser({ user, logout }) {
  const [itemsVisible, setItemsVisible] = useState(false)

  let style = (!itemsVisible ? "ProfileMenuItemHidden " : "") + "ProfileMenuItem "

  return <div className="UserProfile" onMouseEnter={() => setItemsVisible(true)} onMouseLeave={() => setItemsVisible(false)}>
    <button className={style + "MenuItemLogOut"}>Log Out</button>
    <button className={style + "MenuItemSettings"}>Settings</button>
    <button className="linkbutton"><img src={user.picture} alt={user.name} /></button>
  </div>
}

function LoggedOutUser({ loginWithRedirect }) {
  return <div className="UserProfile"><button className="SignInButton" onClick={() => loginWithRedirect()}>Sign In</button></div>
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

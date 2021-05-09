import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain="dev-driftbottle.us.auth0.com"
    clientId="LoY6GBf7kQZzwA6wjE9YTEQpvq7tj5AC"
    redirectUri={window.location.origin}
    audience="https://driftbottle.app/api"
    scope="read:current_user_settings update:current_user_settings">
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);


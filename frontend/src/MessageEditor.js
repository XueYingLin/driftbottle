import './MessageEditor.css';
import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export const MessageEditor = React.forwardRef((props, ref) => {
  const visibilityClass = props.visible ? "visible" : "hidden";
  const className = `MessageEditor ${visibilityClass}`;

  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  return <div className={className}>
    <i onClick={props.close} className="fas fa-times-circle CloseIcon"></i>
    {props.message != null ? <textarea ref={ref} readOnly value={props.message.message} /> : <textarea ref={ref} value={props.value} onChange={props.onChange} />}
    {isAuthenticated ? <div></div> : <div className="SignUpMessage">To sign your message and get replies, <button className="linkbutton" onClick={() => loginWithRedirect()}>log in</button>.</div>}
  </div>
});


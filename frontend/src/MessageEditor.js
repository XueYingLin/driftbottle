import './MessageEditor.css';
import './Stamp.css';
import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { getIconById } from './stamps';

function Signature({ signature }) {
  const stampIcon = getIconById(signature.stamp)

  return <div className="Signature">
    Signed by:&nbsp;
    <i className={"MessageStamp SmallStamp Stamp fas " + stampIcon}></i>&nbsp;
    <span>{signature.nickname}</span>
  </div >;
}

export const MessageEditor = React.forwardRef(({ message, visible, close, onChange, value, mySignature }, ref) => {
  const visibilityClass = visible ? "visible" : "hidden";
  const className = `MessageEditor ${visibilityClass}`;

  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  let signUpMessage;
  if (message === null) {
    signUpMessage = isAuthenticated ?
      <div className="SignUpMessage">
        To change the message signature, head over to <button className="linkbutton">settings</button>.
    </div>
      :
      <div className="SignUpMessage">
        To sign your message and get replies, <button className="linkbutton" onClick={() => loginWithRedirect()}>log in</button>.
    </div>
  }

  return <div className={className}>
    <i onClick={close} className="fas fa-times-circle CloseIcon"></i>
    {message !== null ? <textarea ref={ref} readOnly value={message.message} /> : <textarea ref={ref} value={value} onChange={onChange} />}
    {message !== null && message.signature !== undefined ? <Signature signature={message.signature}></Signature> : <div></div>}
    {signUpMessage}
  </div>
});


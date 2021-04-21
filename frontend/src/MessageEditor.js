import './MessageEditor.css';
import React from 'react';

export const MessageEditor = React.forwardRef((props, ref) => {
  const visibilityClass = props.visible ? "visible" : "hidden";

  const className = `MessageEditor ${visibilityClass}`;

  return <div className={className}>
    <i onClick={props.close} className="fas fa-times-circle CloseIcon"></i>
    {props.message != null ? <textarea ref={ref} readOnly value={props.message.message} /> : <textarea ref={ref} value={props.value} onChange={props.onChange} />}
    <div className="SignUpMessage">To sign your message and get replies, create an account.</div>
  </div>
});


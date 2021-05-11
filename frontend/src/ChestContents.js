import './ChestContents.css'
import { Stamp } from './Stamp'
import { getIconById } from './stamps'

function Message({ message, showMessage }) {
  const icon = message.signature !== undefined ? getIconById(message.signature.stamp) : undefined;
  return <>
    {icon !== undefined ? <Stamp icon={icon} /> : <Stamp icon="fa-user-secret" />}
    <span onClick={() => showMessage(message._id)} className="MessageAuthor">{message.signature !== undefined ? message.signature.nickname : "Anonymous"}</span>
    <span onClick={() => showMessage(message._id)} className="MessageSummary">{message.message}</span>
  </>
}

export function ChestContents({ messages, showMessage }) {
  return <div className="ChestContents">
    <div className="ChestTitle">Your chest</div>
    <div className="ChestMessages">
      {messages.map(msg => <Message message={msg} showMessage={showMessage} />)}
    </div>
  </div>
}
import './MessageEditor.css';


export function MessageEditor(props) {
  const visibilityClass = props.visible ? "visible" : "hidden";

  const className = `MessageEditor ${visibilityClass}`;

  return <div className={className}>
    <i onClick={props.close} className="fas fa-times-circle CloseIcon"></i>
    <textarea value={props.value} onChange={props.onChange} />
  </div>
}
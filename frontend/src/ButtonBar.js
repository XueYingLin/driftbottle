export function useButtonBar(labels) {
  var state = []
  var handlers = []
  for (var i = 0; i < labels.length; i++) {
    state.push({
      enabled: true,
      visible: true
    })
    handlers.push(() => { })
  }
  return {
    labels,
    state,
    handlers,
    setEnabled: (index, enabled) => state[index].enabled = enabled,
    setVisible: (index, visible) => state[index].visible = visible,
    setHandler: (index, handler) => handlers[index] = handler
  }
}

/// buttons is an array of objects containing properties label, clickHandler, enabled
export function ButtonBar({ model }) {
  let buttonElements = []
  for (var i = 0; i < model.labels.length; i++) {
    const label = model.labels[i]
    const state = model.state[i]
    const handler = model.handlers[i]
    if (state.visible) {
      buttonElements.push(<button
        key={label}
        className={state.enabled === undefined || state.enabled === true ? "enabled" : "disabled"}
        onClick={handler}>{label}</button>)
    }
  }

  return <div className="ButtonBar">
    {buttonElements}
  </div>
}
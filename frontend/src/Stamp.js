import './Stamp.css'

export function Stamp({ icon, isSelected, onClick, isSelectable, isLarge }) {
  let cls = ""
  if (isLarge) {
    cls = "LargeStamp "
  }
  if (isSelectable) {
    cls += "SelectableStamp "
  }
  cls += `Stamp fas ${icon} `
  if (isSelected) {
    cls += "SelectedStamp "
  }

  return <i key={icon} onClick={onClick} className={cls} />
}
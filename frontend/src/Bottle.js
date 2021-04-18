import './Bottle.css'

export function Bottle(props) {
  const rotation = `rotate(${props.degrees}deg)`;

  const style = {
    transform: rotation,
    top: `${props.top}%`
  }

  return (
    <img style={style} src="images/bottle.png" height="130" class="Bottle" alt="bottle"></img>
  )
}


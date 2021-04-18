import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { Bottle } from './Bottle';
import { MessageEditor } from './MessageEditor';

// Percentage chance of a bottle appearing every second.
const BOTTLE_DROP_CHANCE = 50

async function submitMessage(message) {
  return await axios.post('http://localhost:4000/api/messages', { message })
}

function App() {
  const [messages, setMessages] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setActive] = useState(true);
  const [bottles, setBottles] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingMessageText, setEditingMessageText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost:4000/api/messages'
      )
      return result.data;
    }
    fetchData().then(data => setMessages(data))
  }, [])

  const onBottleClick = useCallback(key => {
    let messageNumber = Math.floor(Math.random() * messages.length);
    let message = messages[messageNumber];

    console.log("Got message ", message);

    console.log("Removing bottle with key ", key);
    console.log("Bottles: ", bottles);
    let newBottles = bottles.filter(bottle => bottle.key !== key);
    console.log("New bottles ", newBottles);

    setBottles(newBottles);
  }, [bottles, messages]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);

        let changed = false;
        // First, filter out expired bottles.
        const bottlesCopy = bottles.filter(x => {
          if (seconds > x.expiration) {
            return false
          } else {
            return true
          }
        });
        if (bottlesCopy.length !== bottles.length) {
          changed = true;
        }

        // 1% chance every second to generate a new bottle.
        const generate = Math.floor(Math.random() * 100);
        if (bottles.length === 0 || generate <= BOTTLE_DROP_CHANCE) {
          const degrees = Math.floor(Math.random() * 360);
          const top = Math.floor(Math.random() * 50);

          let expiration = seconds + 30;
          const newBottle = {
            expiration,
            key: seconds,
            top,
            degrees
          };

          changed = true;
          bottlesCopy.push(newBottle);
        }

        if (changed) {
          setBottles(bottlesCopy);
        }

      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, bottles, messages]);

  const clickButton = (e) => {
    if (!editing) {
      setEditing(true);
    } else {
      submitMessage(editingMessageText).then(r => {
        setEditingMessageText("");
        setEditing(false);
      });
    }
  };

  const closeMessageEditor = (e) => {
    setEditing(false);
  }

  const onChangeEditText = (e) => {
    setEditingMessageText(e.target.value);
  }

  const buttonClass = () => {
    if (editing && editingMessageText.trim().length === 0) {
      return "disabled";
    }
    return "enabled";
  };

  return (
    <div className="App">
      <div className="AppTitle">driftbottle</div>

      {bottles.map(o => <Bottle onClick={() => onBottleClick(o.key)} key={o.key} top={o.top} degrees={o.degrees} />)}

      <MessageEditor value={editingMessageText} onChange={onChangeEditText} visible={editing} close={closeMessageEditor} />

      <div className="ButtonBar">
        <button className={buttonClass} onClick={clickButton}>{editing ? "Send" : "Write a message"}</button>
      </div>

    </div>
  );
}

export default App;

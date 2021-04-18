import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { Bottle } from './Bottle';
import { MessageEditor } from './MessageEditor';

async function submitMessage(message) {
  return await axios.post('http://localhost:4000/api/messages', { message })
}

function App() {
  const [messages, setMessages] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setActive] = useState(true);
  const [bottles, setBottles] = useState([
    { element: <Bottle degrees="280" top="7" key="0" />, expiration: 21 }]);
  const [editing, setEditing] = useState(false);
  const [editingMessageText, setEditingMessageText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost:4000/api/messages'
      )
      setMessages(result.data);
    }
    fetchData()
  }, [])

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);

        let changed = false;
        // First, filter out expired bottles.
        const bottlesCopy = bottles.filter(x => {
          if (seconds > x.expiration) {
            console.log(`Removing bottle with expiration at ${seconds}`, x.expiration);
            return false
          } else {
            return true
          }
        });
        if (bottlesCopy.length !== bottles.length) {
          changed = true;
          console.log(`[${seconds}] Bottles after removal:`, bottlesCopy);
        }

        // 1% chance every second to generate a new bottle.
        const generate = Math.floor(Math.random() * 100);
        if (generate <= 8) {
          const angle = Math.floor(Math.random() * 360);
          const top = Math.floor(Math.random() * 50);

          let expiration = seconds + 30;
          const newBottle = {
            element: <Bottle degrees={angle} key={seconds} top={top} />,
            expiration
          };

          changed = true;
          bottlesCopy.push(newBottle);
          console.log(`[${seconds}] Bottles after addition:`, bottlesCopy);
        }

        if (changed) {
          setBottles(bottlesCopy);
        }

      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, bottles]);

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

      {bottles.map(o => o.element)}

      <MessageEditor value={editingMessageText} onChange={onChangeEditText} visible={editing} close={closeMessageEditor} />

      <div className="ButtonBar">
        <button className={buttonClass()} onClick={clickButton}>{editing ? "Send" : "Write a message"}</button>
      </div>

    </div>
  );
}

export default App;

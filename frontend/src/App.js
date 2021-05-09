import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Bottle } from './Bottle';
import { MessageEditor } from './MessageEditor';
import { SettingsEditor } from './SettingsEditor';
import { AppTitle } from './AppTitle';

// Percentage chance of a bottle appearing every second.
const BOTTLE_DROP_CHANCE = 8

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
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const textRef = useRef(null);

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

    setEditing(false);
    setViewingMessage(message);

    let newBottles = bottles.filter(bottle => bottle.key !== key);

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
      setViewingMessage(null);
      window.setTimeout(() => { textRef.current.focus(); }, 100);
    } else {
      submitMessage(editingMessageText).then(r => {
        setEditingMessageText("");
        setEditing(false);
      });
    }
  };

  const closeMessageEditor = (e) => {
    setEditingMessageText("");
    setEditing(false);
    setViewingMessage(null);
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
      <AppTitle showSettings={setShowSettings} />

      {bottles.map(o => <Bottle onClick={() => onBottleClick(o.key)} key={o.key} top={o.top} degrees={o.degrees} />)}

      <MessageEditor ref={textRef} message={viewingMessage} value={editingMessageText} onChange={onChangeEditText} visible={editing || viewingMessage != null} close={closeMessageEditor} />
      <SettingsEditor visible={showSettings} showSettings={setShowSettings} />

      <div className="ButtonBar">
        <button className={buttonClass()} onClick={clickButton}>{editing ? "Send" : "Write a message"}</button>
      </div>

    </div>
  );
}

export default App;

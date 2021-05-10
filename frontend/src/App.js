import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Bottle } from './Bottle';
import { MessageEditor } from './MessageEditor';
import { SettingsEditor } from './SettingsEditor';
import { AppTitle } from './AppTitle';
import { useAuth0 } from "@auth0/auth0-react";

// Percentage chance of a bottle appearing every second.
const BOTTLE_DROP_CHANCE = 8


function Chest() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await getAccessTokenSilently({
        audience: `https://driftbottle.app/api`,
        scope: "read:current_user_settings",
      })

      const result = await axios(
        'http://localhost:4000/api/chest',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      console.log(result.data)
      return result.data;
    }
    fetchData().then()
  }, [getAccessTokenSilently])

  return <div className="TreasureChest" style={{ visibility: isAuthenticated ? "visible" : "hidden" }}>
    <img src="images/treasurechest.webp" width="100" alt="Treasure Chest"></img>
  </div>
}

async function submitMessage(message, isAuthenticated, getAccessTokenSilently) {
  let config = {}
  if (isAuthenticated) {
    const accessToken = await getAccessTokenSilently({
      audience: `https://driftbottle.app/api`,
      scope: "read:current_user_settings",
    })
    config.headers = {
      Authorization: `Bearer ${accessToken}`
    }
  }


  return await axios.post('http://localhost:4000/api/messages', { message }, config)
}

async function storeInChest(message, getAccessTokenSilently) {
  const accessToken = await getAccessTokenSilently({
    audience: `https://driftbottle.app/api`,
    scope: "read:current_user_settings",
  })

  return await axios.put(`http://localhost:4000/api/chest/${message._id}`, null, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

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
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

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
      if (isAuthenticated && viewingMessage !== null) {
        storeInChest(viewingMessage, getAccessTokenSilently)
      } else {
        setEditing(true);
        setViewingMessage(null);
        window.setTimeout(() => { textRef.current.focus(); }, 100);
      }
    } else {
      submitMessage(editingMessageText, isAuthenticated, getAccessTokenSilently).then(r => {
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

  const showReply = isAuthenticated && viewingMessage !== null && viewingMessage.signature !== null
  let mainButtonText = "";
  if (editing) {
    mainButtonText = "Send"
  } else {
    if (isAuthenticated && viewingMessage !== null) {
      mainButtonText = "Store in chest"
    } else {
      mainButtonText = "Write a message"
    }
  }

  return (
    <div className="App">
      <AppTitle showSettings={setShowSettings} />

      {bottles.map(o => <Bottle onClick={() => onBottleClick(o.key)} key={o.key} top={o.top} degrees={o.degrees} />)}

      <MessageEditor ref={textRef} message={viewingMessage} value={editingMessageText} onChange={onChangeEditText} visible={editing || viewingMessage != null} close={closeMessageEditor} />
      <SettingsEditor visible={showSettings} showSettings={setShowSettings} />

      <div className="ButtonBar">
        <button className={buttonClass()} onClick={clickButton}>{mainButtonText}</button>
        {showReply ?
          <button className="enabled">Reply</button> : <div></div>
        }
      </div>

      <Chest />

    </div>
  );
}

export default App;

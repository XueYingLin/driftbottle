import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Bottle } from './Bottle';
import { MessageEditor } from './MessageEditor';
import { SettingsEditor } from './SettingsEditor';
import { AppTitle } from './AppTitle';
import { useAuth0 } from "@auth0/auth0-react";
import { ButtonBar, useButtonBar } from './ButtonBar';
import { ChestContents } from './ChestContents';
import config from './config';

// Percentage chance of a bottle appearing every second.
const BOTTLE_DROP_CHANCE = 5


function Chest({ messages, onClick }) {
  return <div className="TreasureChest">
    <span style={{ visibility: messages.length > 0 ? "visible" : "hidden" }} className="MessageCountBadge">{messages.length}</span>
    <img onClick={onClick} src="images/treasurechest.webp" width="100" alt="Treasure Chest"></img>
  </div>
}

const MESSAGE_STATE_NONE = 0
const MESSAGE_STATE_VIEWING = 1
const MESSAGE_STATE_EDITING = 2

function App() {
  const [messages, setMessages] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [bottles, setBottles] = useState([]);
  const [messageState, setMessageState] = useState(MESSAGE_STATE_NONE);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [chestMessages, setChestMessages] = useState([]);
  const [chestOpen, setChestOpen] = useState(false);

  const textRef = useRef(null);

  // Callback to get auth headers for an API call.
  const getAuthHeaders = useCallback(async (scope) => {
    let config = {}
    if (isAuthenticated) {
      const accessToken = await getAccessTokenSilently({
        audience: `https://driftbottle.app/api`,
        scope,
      })
      config.headers = {
        Authorization: `Bearer ${accessToken}`
      }
    }
    return config
  }, [getAccessTokenSilently, isAuthenticated])

  // Set up buttons
  const buttons = useButtonBar(["Write a message", "Store in chest", "Send"])
  {
    const BUTTON_WRITE = 0
    const BUTTON_STORE = 1
    const BUTTON_SEND = 2

    const writeMessage = () => {
      setMessageState(MESSAGE_STATE_EDITING);
      setViewingMessage(null);
      window.setTimeout(() => { textRef.current.focus(); }, 100);
    }

    const store = async () => {
      await axios.put(`${config.baseUrl}/api/chest/${viewingMessage._id}`,
        null,
        await getAuthHeaders("read:current_user_settings"))

      setMessageState(MESSAGE_STATE_NONE)
      if (chestMessages.some(msg => msg._id === viewingMessage._id)) return

      let messages = [...chestMessages]
      messages.push(viewingMessage)
      setChestMessages(messages)
    }

    const sendMessage = async () => {
      let newMessage = await axios.post(`${config.baseUrl}/api/messages`,
        { message: editingMessageText },
        await getAuthHeaders("read:current_user_settings"))
      let updatedMessages = [...messages]
      updatedMessages.push(newMessage.data)
      setMessages(updatedMessages)

      setEditingMessageText("");
      setMessageState(MESSAGE_STATE_NONE);
    }

    buttons.setHandler(BUTTON_WRITE, writeMessage)
    buttons.setHandler(BUTTON_STORE, store)
    buttons.setHandler(BUTTON_SEND, sendMessage)

    buttons.setVisible(BUTTON_WRITE, messageState === MESSAGE_STATE_NONE)
    buttons.setVisible(BUTTON_STORE, messageState === MESSAGE_STATE_VIEWING && isAuthenticated && !chestMessages.some(msg => msg._id === viewingMessage._id))
    buttons.setVisible(BUTTON_SEND, messageState === MESSAGE_STATE_EDITING)
    buttons.setEnabled(BUTTON_SEND, editingMessageText.trim().length !== 0)
  }

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        `${config.baseUrl}/api/messages`
      )
      return result.data;
    }
    fetchData().then(data => setMessages(data))
  }, [])

  const onBottleClick = useCallback(key => {
    let messageNumber = Math.floor(Math.random() * messages.length);
    let message = messages[messageNumber];

    setMessageState(MESSAGE_STATE_VIEWING);
    setViewingMessage(message);

    let newBottles = bottles.filter(bottle => bottle.key !== key);

    setBottles(newBottles);
  }, [bottles, messages]);


  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        const result = await axios(
          `${config.baseUrl}/api/chest`,
          await getAuthHeaders("read:current_user_settings")
        )
        return result.data;
      }
      fetchData().then(data => setChestMessages(data.messages))
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    let interval = null;
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
        const top = 20 + Math.floor(Math.random() * 30);

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

    return () => clearInterval(interval);
  }, [seconds, bottles, messages]);


  const closeMessageEditor = (e) => {
    setEditingMessageText("");
    setMessageState(MESSAGE_STATE_NONE);
    setViewingMessage(null);
  }

  const onChangeEditText = (e) => {
    setEditingMessageText(e.target.value);
  }

  const onClickChest = (e) => {
    setChestOpen(!chestOpen)
  }

  const showMessage = (messageId) => {
    let message = messages.find(msg => msg._id === messageId)
    if (message) {
      setMessageState(MESSAGE_STATE_VIEWING)
      setViewingMessage(message)
    }
  }

  return (
    <div className="App">
      <AppTitle showSettings={setShowSettings} />

      {bottles.map(o => <Bottle onClick={() => onBottleClick(o.key)} key={o.key} top={o.top} degrees={o.degrees} />)}

      <MessageEditor ref={textRef} message={viewingMessage} value={editingMessageText} onChange={onChangeEditText} visible={messageState !== MESSAGE_STATE_NONE} close={closeMessageEditor} />
      <SettingsEditor visible={showSettings} showSettings={setShowSettings} />

      <ButtonBar model={buttons} />

      {isAuthenticated ? <Chest messages={chestMessages} onClick={onClickChest} /> : <div />}
      {chestOpen ? <ChestContents showMessage={showMessage} messages={chestMessages} /> : <div />}

    </div>
  );
}

export default App;

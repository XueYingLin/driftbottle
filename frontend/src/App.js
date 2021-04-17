import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost:4000/api/messages'
      )
      setMessages(result.data);
    }
    fetchData()
  }, [])

  return (
    <div className="App">
      {messages.map(msg => {
        return <div>{msg.text}</div>
      })}
    </div>
  );
}

export default App;

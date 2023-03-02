import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChatClient } from './chat-client';

const URL = 'wss://09xqig1wrd.execute-api.us-east-2.amazonaws.com/production/';

const App = () => {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatRows, setChatRows] = useState<React.ReactNode[]>([]);
  let name;

  const onSocketOpen = useCallback(() => {
    setIsConnected(true);
    name = prompt('Informe o seu nome:');
    if (name !== null && name !== "") {
      
      socket.current?.send(JSON.stringify({ action: 'setName', name }));
    }
  }, []);

  const onSocketClose = useCallback(() => {
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    const data = JSON.parse(dataStr);
    if (data.members) {
      setMembers(data.members);
    } else if (data.publicMessage) {
      setChatRows(oldArray => [...oldArray, <span><b>{data.publicMessage}</b></span>]);
    } else if (data.privateMessage) {
      alert(data.privateMessage);
    } else if (data.systemMessage) {
      setChatRows(oldArray => [...oldArray, <span><i>{data.systemMessage}</i></span>]);
    }
  }, []);

  const onConnect = useCallback(() => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL);
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose);
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  const onSendPrivateMessage = useCallback((to: string) => {
    const message = prompt('Mensagem privada para: ' + to);
    if (message !== null && message !== "" && to !== name) {
      socket.current?.send(JSON.stringify({
        action: 'sendPrivate',
        message,
        to,
      }));
    }
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt('Mensagem pública');
    if (message !== null && message !== "") {
      socket.current?.send(JSON.stringify({
        action: 'sendPublic',
        message,
      }));
    }
  }, []);

  const onSendBotMessage = useCallback(() => { 
    const message = prompt('Mensagem  para BOT ');
    if (message !== null && message !== "") {
      socket.current?.send(JSON.stringify({
        action: 'sendBot',
        message
      }));
    }
   }, []);

  const onDisconnect = useCallback(() => {
    if (isConnected) {
      socket.current?.close();
    }
  }, [isConnected]);

  return <ChatClient
    isConnected={isConnected}
    members={members}
    chatRows={chatRows}
    onPublicMessage={onSendPublicMessage}
    onPrivateMessage={onSendPrivateMessage}
    onBotMessage={onSendBotMessage}
    onConnect={onConnect}
    onDisconnect={onDisconnect}
  />;
}

export default App;

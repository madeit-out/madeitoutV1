import { useEffect } from 'react';
import { ChatSocket } from '../adapters/socketAdapter';

function ChatBox({ tripId }) {
  useEffect(() => {
    ChatSocket.connect();
    ChatSocket.joinRoom(tripId);

    ChatSocket.onMessage((msg) => {
      console.log('New message:', msg);
    });

    return () => {
      ChatSocket.offMessage();
      ChatSocket.disconnect();
    };
  }, [tripId]);

  const handleSend = () => {
    ChatSocket.sendMessage(tripId, { text: 'Hello World' });
  };

  return <button onClick={handleSend}>Send</button>;
}


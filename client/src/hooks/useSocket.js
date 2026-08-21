import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Use the backend URL provided by the Vite proxy or the env variable
    const socketUrl = url || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    });

    socketRef.current.on('connect', () => {
      console.log('🟢 Connected to WebSocket server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    setSocket(socketRef.current);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return { socket, isConnected };
};

export default useSocket;

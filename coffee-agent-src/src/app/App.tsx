import { useState } from 'react';
import { ChatWindow } from './components/ChatWindow';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
      <ChatWindow />
    </div>
  );
}

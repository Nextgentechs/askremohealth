"use client";
import { BadgeCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";


interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  senderFirstName: string | null;
  senderLastName: string | null;
}

interface ChatRoomProps {
  chatId: string;
  currentUserId: string;
  messages: Message[];
  otherUserName: string;
  otherUserProfilePicture: string | null;
  isOtherUserDoctor: boolean;
}

const ChatRoom = ({ chatId, currentUserId, messages: initialMessages, otherUserName, otherUserProfilePicture, isOtherUserDoctor }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.emit("join-chat", chatId);

    socketInstance.on("new-message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const response = await fetch(`/api/community/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });

    if (response.ok) {
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="p-3 border-b border-t bg-gray-50 flex-shrink-0">
        <div className="flex -ml-1 gap-2 items-center">
            <Link href="/community/chats">
              <ChevronLeft />
              <Image
                src={otherUserProfilePicture ?? "/noAvatar.png"}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
            <div className="flex items-center gap-0.5" >
                <h2 className="font-semibold">{otherUserName}</h2>
                {isOtherUserDoctor && (
                    <BadgeCheck size={20} className="fill-violet-900 text-white" />
                )}
            </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-violet-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-violet-900 text-white rounded-lg hover:bg-violet-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
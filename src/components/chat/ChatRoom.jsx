import { useState, useEffect, useRef } from "react";
import { fireStore } from "../../config/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  updateDoc, doc, increment
} from "firebase/firestore";
// import { getMessagesOfChatRoom, sendMessage } from "../../services/ChatService";

import Message from "./Message";
// import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket }) {
  console.log(currentChat);
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);

  const scrollRef = useRef();

  const getChatsHistory = async (id) => {
    if (id == undefined) return;
    console.log("getChatsHistory", id);
    let path = `chats/${id}/messages`;
    const q = await query(collection(fireStore, path), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let msg = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        msg.push({
          text: doc.data().text,
          createdAt: doc.data().createdAt,
          sender: doc.data().author?.id,
          msgid: doc.id
        })
      });

      setMessages(msg);
    });
  };
  console.log(messages);

  useEffect(() => {
    const fetchData = async () => {
      await getChatsHistory(currentChat.id);
    };
    fetchData();
  }, [currentChat.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    // incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
  }, [incomingMessage]);

  const handleFormSubmit = async (message) => {
    let id = currentChat.id;
    let path = `chats/${id}/messages`;
    const messageBody = {
      id: id,
      text: message,
      createdAt: Date.now(),
      author: {
        id: "admin",
        name: "admin"
      },
      type: "text"
    };
    addDoc(collection(fireStore, path), messageBody);
    const messageBody2 = {
      lastmessage: message,
      [id]: increment(1),
      unreadUsers: [
        id
      ]
    };
    updateDoc(doc(fireStore, "chats", id), messageBody2);
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        {/* <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <Contact chatRoom={currentChat} currentUser={currentUser} />
        </div> */}

        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages && messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message message={message} self={currentUser?.id} />
              </div>
            ))}
          </ul>
        </div>

        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}

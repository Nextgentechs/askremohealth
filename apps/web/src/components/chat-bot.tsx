"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, Minimize2, Maximize2, MessageSquare } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar } from "./ui/avatar"
import { Card } from "./ui/card"
import { cn } from "@web/lib/utils"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Chat Logic
  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! How can I assist you today?"
    } else if (input.includes("help")) {
      return "I can help you with information about our products, services, or answer general questions. What would you like to know?"
    } else if (input.includes("product") || input.includes("service")) {
      return "We offer a range of innovative products and services. Would you like me to tell you more about a specific one?"
    } else if (input.includes("contact") || input.includes("support")) {
      return "You can reach our support team at support@example.com or call us at (555) 123-4567."
    } else if (input.includes("price") || input.includes("cost")) {
      return "Our pricing varies depending on the product or service. Can you specify which one you're interested in?"
    } else {
      return "I'm not sure I understand. Could you rephrase your question or ask me something else?"
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 lg:w-18 lg:h-18 p-0 bg-[#402E7D] hover:bg-[#402E7D] shadow-lg"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6 lg:w-10 lg:h-10" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 w-80 sm:w-96 md:w-[500px] bg-white rounded-lg shadow-xl transition-all duration-300 overflow-hidden z-[4]",
        isMinimized ? "h-14" : "h-[500px] max-h-[80vh]",
      )}
    >
      {/* Chat header */}
      <div className="bg-[#402E7D] text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white-300">
            <div className="bg-[#402E7D] h-full w-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[#fff]" />
            </div>
          </Avatar>
          <span className="text-sm md:font-medium">Ask RemoHealth Assistant</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#fff] hover:text-white "
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#fff] hover:text-white"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat messages */}
          <div className="p-4 h-[calc(100%-120px)] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 animate-fadeIn",
                      message.sender === "user"
                        ? "bg-[#402E7D] text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat input */}
          <div className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Please describe your symptoms..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#402E7D] focus:border-transparent"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-[#402E7D] hover:bg-[#402E7D] text-white"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  )
}

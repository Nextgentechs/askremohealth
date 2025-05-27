'use client'

import { cn } from '@web/lib/utils'
import { Maximize2, MessageSquare, Minimize2, Send, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card } from './ui/card'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi there! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Create a persistent session ID
  const [sessionId] = useState(() => {
    return 'session-' + Math.random().toString(36).substring(2, 15)
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const botReply = await getBotResponse(input)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content:
            'There was a problem connecting to the assistant. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const getBotResponse = async (userInput: string): Promise<string> => {
    try {
      const res = await fetch(
        'https://remo-health-assistant.onrender.com/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, message: userInput }),
        },
      )

      if (!res.ok) {
        const text = await res.text()
        console.error('Backend error:', text)
        throw new Error('Bad response')
      }

      const data = await res.json()
      return data.response ?? "I'm sorry, I didn't understand that."
    } catch (error) {
      console.error('Fetch failed:', error)
      throw error
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-4 py-8 bg-[#402E7D] hover:bg-[#402E7D] text-white rounded-3xl flex items-center space-x-2 shadow-lg"
        aria-label="Open chat"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm md:text-md font-medium">Ask RemoHealth Assistant</span>
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 w-80 sm:w-96 md:w-[500px] bg-white rounded-lg shadow-xl transition-all duration-300 overflow-hidden z-[4]',
        isMinimized ? 'h-14' : 'h-[500px] max-h-[80vh]',
      )}
    >
      {/* Header */}
      <div className="bg-[#402E7D] text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white-300">
            <div className="bg-[#402E7D] h-full w-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[#fff]" />
            </div>
          </Avatar>
          <span className="text-sm md:font-medium">
            Ask RemoHealth Assistant
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#fff] hover:text-white"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
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
          {/* Messages */}
          <div className="p-4 h-[calc(100%-120px)] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 animate-fadeIn',
                      message.sender === 'user'
                        ? 'bg-[#402E7D] text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none',
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
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
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

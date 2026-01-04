import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Paperclip, Smile, Maximize2, Minimize2 } from 'lucide-react';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! Welcome to Ledgerly support. How can I help you today?', sender: 'bot', time: '10:00 AM' },
    { id: 2, text: 'I need help with invoice generation', sender: 'user', time: '10:01 AM' },
    { id: 3, text: 'Sure! I can help you with that. Are you having trouble with creating a new invoice or editing an existing one?', sender: 'bot', time: '10:02 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "I understand. Let me help you with that.",
        "Thanks for your message. I'm looking into it now.",
        "Could you provide more details about what you need help with?",
        "I'll connect you with a support agent shortly.",
        "Please check our knowledge base for detailed guides."
      ];
      
      const botResponse = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    'Need help with invoices',
    'Payment issues',
    'Report a bug',
    'Account settings',
    'Talk to human agent'
  ];

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  const handleAttachment = () => {
    // Implement file attachment logic
    console.log('Attachment clicked');
  };

  const handleEmoji = () => {
    // Implement emoji picker logic
    console.log('Emoji picker clicked');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
          aria-label="Open live chat"
        >
          <MessageSquare className="w-6 h-6" />
          {!agentOnline && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-t-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${agentOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">Live Support</h3>
                  <p className="text-xs opacity-90">
                    {agentOnline ? 'Agent online • Responds in 2 mins' : 'Offline • Leave a message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-white/20 rounded"
                  aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-white/20 rounded"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Body - Only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="h-[calc(500px-180px)] overflow-y-auto p-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-primary-100 text-primary-600 ml-3' : 'bg-gray-200 text-gray-600 mr-3'}`}>
                        {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={`rounded-xl px-4 py-2 ${message.sender === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                          {message.text}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                          {message.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl rounded-tl-none px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-2">Quick replies:</div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 border-0 focus:ring-0 resize-none max-h-24"
                      rows="2"
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAttachment}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="Attach file"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleEmoji}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="Add emoji"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className={`flex items-center px-4 py-1.5 rounded-lg ${inputText.trim() ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
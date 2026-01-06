import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  MessageSquare, X, Send, User, Bot, Paperclip, 
  Smile, Maximize2, Minimize2, FileText, Receipt,
  Package, CreditCard, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { InvoiceContext } from '../../context/InvoiceContext';

const LiveChat = () => {
  const { isDarkMode } = useTheme();
  const { invoices, customers, products } = useContext(InvoiceContext) || {};
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hello! Welcome to Ledgerly Support. How can I help you with your invoices today?', 
      sender: 'bot', 
      time: '10:00 AM',
      type: 'text'
    },
    { 
      id: 2, 
      text: 'I need help with an overdue invoice', 
      sender: 'user', 
      time: '10:01 AM',
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showInvoiceSelector, setShowInvoiceSelector] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get real invoice data
  const getOverdueInvoices = () => {
    if (!invoices) return [];
    return invoices.filter(inv => inv.status === 'overdue');
  };

  const getPendingInvoices = () => {
    if (!invoices) return [];
    return invoices.filter(inv => inv.status === 'pending');
  };

  const getRecentInvoices = () => {
    if (!invoices) return [];
    return invoices.slice(0, 5); // Get last 5 invoices
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Analyze user message and provide contextual response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = analyzeMessageAndRespond(inputText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const analyzeMessageAndRespond = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('invoice') || message.includes('bill')) {
      if (message.includes('overdue') || message.includes('late')) {
        const overdueCount = getOverdueInvoices().length;
        return {
          id: messages.length + 2,
          text: `I found ${overdueCount} overdue invoices. Would you like me to send reminders for them?`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          actions: ['Send reminders', 'View overdue invoices', 'Payment plans']
        };
      } else if (message.includes('create') || message.includes('new')) {
        return {
          id: messages.length + 2,
          text: 'I can help you create a new invoice. What customer should I bill?',
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          actions: ['Select customer', 'Use template', 'Cancel']
        };
      } else if (message.includes('pending') || message.includes('unpaid')) {
        const pendingCount = getPendingInvoices().length;
        const totalAmount = getPendingInvoices().reduce((sum, inv) => sum + (inv.amount || 0), 0);
        return {
          id: messages.length + 2,
          text: `You have ${pendingCount} pending invoices totaling $${totalAmount.toLocaleString()}. Would you like to send follow-up emails?`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          actions: ['Send follow-ups', 'View pending invoices', 'Export report']
        };
      }
    } else if (message.includes('customer') || message.includes('client')) {
      if (customers && customers.length > 0) {
        return {
          id: messages.length + 2,
          text: `I found ${customers.length} customers in your database. Would you like to view a specific customer's details?`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          actions: customers.slice(0, 3).map(c => c.name)
        };
      }
    } else if (message.includes('payment') || message.includes('paid')) {
      return {
        id: messages.length + 2,
        text: 'I can help you record a payment or check payment status. What invoice number are you referring to?',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        actions: ['Record payment', 'Check status', 'View payment history']
      };
    } else if (message.includes('report') || message.includes('analytics')) {
      return {
        id: messages.length + 2,
        text: 'I can generate various reports for you. What would you like to see?',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        actions: ['Revenue report', 'Outstanding invoices', 'Customer aging', 'Tax summary']
      };
    }

    // Default response
    return {
      id: messages.length + 2,
      text: "I understand. How can I assist you with your invoicing needs? You can ask me about invoices, payments, customers, or reports.",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      actions: ['Invoice help', 'Payment issues', 'Customer questions', 'Report generation']
    };
  };

  const handleQuickAction = (action) => {
    let response = '';
    
    switch(action) {
      case 'Send reminders':
        // Send reminders logic
        response = 'I have sent payment reminders for all overdue invoices.';
        break;
      case 'View overdue invoices':
        setShowInvoiceSelector(true);
        response = 'Here are your overdue invoices:';
        break;
      case 'Send follow-ups':
        response = 'Follow-up emails have been sent to customers with pending invoices.';
        break;
      case 'Record payment':
        response = 'Please provide the invoice number and payment amount.';
        break;
      default:
        response = `You selected: ${action}. How can I proceed with this?`;
    }

    const userActionMessage = {
      id: messages.length + 1,
      text: action,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'action'
    };

    const botResponse = {
      id: messages.length + 2,
      text: response,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, userActionMessage, botResponse]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    'Overdue invoices',
    'Create new invoice',
    'Pending payments',
    'Customer details',
    'Generate report',
    'Tax questions'
  ];

  const handleQuickReply = (text) => {
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, userMessage]);
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = analyzeMessageAndRespond(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleAttachment = () => {
    // In a real app, this would open file picker
    const fileMessage = {
      id: messages.length + 1,
      text: 'invoice_attachment.pdf',
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'file',
      fileType: 'pdf'
    };

    setMessages([...messages, fileMessage]);
    
    // Bot acknowledges file
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: 'I have received your invoice attachment. Would you like me to analyze it?',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        actions: ['Analyze invoice', 'Attach to customer', 'Convert to template']
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceSelector(false);
    
    const message = {
      id: messages.length + 1,
      text: `Selected Invoice: ${invoice.invoiceNumber} - ${invoice.customer}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, message]);
    
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: `Invoice ${invoice.invoiceNumber} details:\nAmount: $${invoice.amount}\nDue: ${invoice.dueDate}\nStatus: ${invoice.status}\n\nWhat would you like to do with this invoice?`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        actions: ['Send reminder', 'Mark as paid', 'Download PDF', 'View details']
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
      setShowInvoiceSelector(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setShowInvoiceSelector(false);
    }
  };

  // Render message with different types
  const renderMessage = (message) => {
    switch(message.type) {
      case 'file':
        return (
          <div className={`flex items-center p-2 rounded-lg ${isDarkMode ? 'bg-primary-900/30' : 'bg-primary-50'}`}>
            <FileText className="w-5 h-5 mr-2" />
            <span className="text-sm">{message.text}</span>
            <span className="ml-2 text-xs opacity-70">({message.fileType})</span>
          </div>
        );
      case 'invoice':
        return (
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                <span className="font-medium">{message.data.invoiceNumber}</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${message.data.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {message.data.status}
              </span>
            </div>
            <div className="mt-2 text-sm">
              <div>Customer: {message.data.customer}</div>
              <div>Amount: ${message.data.amount}</div>
              <div>Due: {message.data.dueDate}</div>
            </div>
          </div>
        );
      default:
        return message.text;
    }
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
          {getOverdueInvoices().length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full border-2 border-white flex items-center justify-center">
              {getOverdueInvoices().length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl shadow-2xl transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[550px]'} ${
          isDarkMode 
            ? 'bg-gray-800 text-gray-100' 
            : 'bg-white text-gray-900'
        }`}>
          {/* Header */}
          <div className={`rounded-t-xl p-4 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-primary-800 to-primary-900 text-white' 
              : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/20' : 'bg-white/20'
                  }`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                    isDarkMode ? 'border-primary-800' : 'border-white'
                  } ${agentOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">Invoice Assistant</h3>
                  <p className="text-xs opacity-90">
                    {getOverdueInvoices().length > 0 
                      ? `${getOverdueInvoices().length} overdue invoices • ` 
                      : ''}
                    {agentOnline ? 'Available' : 'Away'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className={`p-1 rounded ${
                    isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/20'
                  }`}
                  aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className={`p-1 rounded ${
                    isDarkMode ? 'hover:bg-white/20' : 'hover:bg-white/20'
                  }`}
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
              <div className={`h-[calc(550px-200px)] overflow-y-auto p-4 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? isDarkMode 
                            ? 'bg-primary-900/50 text-primary-300 ml-3' 
                            : 'bg-primary-100 text-primary-600 ml-3'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 mr-3'
                            : 'bg-gray-200 text-gray-600 mr-3'
                      }`}>
                        {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={`rounded-xl px-4 py-2 ${message.sender === 'user' 
                          ? isDarkMode
                            ? 'bg-primary-700 text-white rounded-tr-none'
                            : 'bg-primary-600 text-white rounded-tr-none'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 rounded-tl-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                          {renderMessage(message)}
                        </div>
                        <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-right' : ''} ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </div>
                        
                        {/* Action Buttons for Bot Messages */}
                        {message.sender === 'bot' && message.actions && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickAction(action)}
                                className={`px-2 py-1 text-xs rounded ${
                                  isDarkMode
                                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Invoice Selector */}
                {showInvoiceSelector && invoices && invoices.length > 0 && (
                  <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="text-sm font-medium mb-2">Select an invoice:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {invoices.slice(0, 5).map((invoice) => (
                        <button
                          key={invoice.id}
                          onClick={() => handleInvoiceSelect(invoice)}
                          className={`w-full text-left p-2 rounded flex items-center justify-between ${
                            isDarkMode 
                              ? 'hover:bg-gray-600' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            <div className="text-xs opacity-70">{invoice.customer}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${invoice.amount}</div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {invoice.status}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="flex">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className={`rounded-xl rounded-tl-none px-4 py-3 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                          }`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                          }`} style={{ animationDelay: '0.2s' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                          }`} style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className={`px-4 py-2 border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className={`text-xs mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Quick actions:
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className={`border-t p-4 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-end space-x-2">
                  <div className={`flex-1 border rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about invoices, payments, customers..."
                      className={`w-full px-3 py-2 border-0 focus:ring-0 resize-none max-h-24 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                          : 'bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      rows="2"
                    />
                    <div className={`flex items-center justify-between px-3 py-2 border-t ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAttachment}
                          className={`p-1 hover:text-gray-700 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          aria-label="Attach invoice"
                          title="Attach invoice file"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowInvoiceSelector(!showInvoiceSelector)}
                          className={`p-1 hover:text-gray-700 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          aria-label="Select invoice"
                          title="Select existing invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {getOverdueInvoices().length} overdue
                        </span>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputText.trim()}
                          className={`flex items-center px-4 py-1.5 rounded-lg ${
                            inputText.trim() 
                              ? 'bg-primary-600 text-white hover:bg-primary-700' 
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Ask about: Invoices • Payments • Customers • Reports
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
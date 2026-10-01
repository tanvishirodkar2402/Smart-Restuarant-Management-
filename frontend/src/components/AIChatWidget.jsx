import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Bot, Mic, Send, X, Sparkles, Volume2, Plus, Star, Package, RefreshCw, ArrowRight } from 'lucide-react';

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm your Smart Restaurant AI Assistant. Ask me anything about our menu, recommendations, or ask 'Where is my order?' to track your live food!",
      recommendedItems: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const { reply, recommended_items, order_data } = res.data;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          recommendedItems: recommended_items || [],
          orderData: order_data || null
        }
      ]);

      // Broadcast order update to the rest of the application/website
      if (order_data) {
        window.dispatchEvent(new CustomEvent('orderUpdated', { detail: order_data }));
        window.dispatchEvent(new CustomEvent('refreshOrders'));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having a little trouble connecting right now, but our full menu is available anytime!",
          recommendedItems: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice speech recognition simulation / Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in your browser. Try typing your command!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      
      // Send to voice parse API
      try {
        setMessages((prev) => [...prev, { sender: 'user', text: `🎤 Voice: "${transcript}"` }]);
        setLoading(true);
        const res = await api.post('/ai/voice-parse', { message: transcript });
        const { matched_items, message } = res.data;

        if (matched_items && matched_items.length > 0) {
          matched_items.forEach(mi => {
            addToCart({ id: mi.food_item_id, name: mi.name, price: mi.price }, mi.quantity);
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: message,
            recommendedItems: []
          }
        ]);
      } catch (err) {
        handleSendMessage(transcript);
      } finally {
        setLoading(false);
      }
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-bold shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Bot className="w-6 h-6" />
          <span className="text-sm font-extrabold pr-1">Ask AI Assistant</span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[520px] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-slate-950">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                  Smart AI Concierge <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online & ready
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Embedded Live Order Status Card */}
                {msg.orderData && (
                  <div className="mt-2.5 w-full bg-slate-900/95 border border-amber-500/40 rounded-2xl p-3 space-y-2.5 text-xs shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-100">
                        <Package className="w-4 h-4 text-amber-400" />
                        <span>{msg.orderData.order_number}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        msg.orderData.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        msg.orderData.status === 'Ready' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        msg.orderData.status === 'Completed' ? 'bg-slate-800 text-slate-300' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {msg.orderData.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>{msg.orderData.order_type} {msg.orderData.table ? `• Table #${msg.orderData.table.table_number}` : ''}</span>
                      <span className="font-bold text-amber-400">₹{parseFloat(msg.orderData.total_amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/orders/${msg.orderData.id}/track`);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 hover:brightness-110"
                      >
                        Track Live <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSendMessage("Where is my order?")}
                        title="Refresh order status"
                        className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Refresh</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Recommended Food Cards embedded in chat */}
                {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                  <div className="mt-2.5 space-y-2 w-full">
                    {msg.recommendedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-200">{item.name}</span>
                            <span className="text-xs text-amber-400 font-semibold">₹{item.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:bg-amber-400"
                        >
                          <Plus className="w-3.5 h-3.5" /> Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded-xl w-fit">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Fetching latest details...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Intent Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSendMessage("Where is my order?")}
              className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 hover:text-amber-200 hover:bg-amber-500/30 border border-amber-500/40 font-bold"
            >
              📦 Where is my order?
            </button>
            <button
              onClick={() => handleSendMessage("What are your best pizzas?")}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 border border-slate-700"
            >
              🍕 Best Pizzas
            </button>
            <button
              onClick={() => handleSendMessage("Show me vegetarian food")}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 border border-slate-700"
            >
              🥗 Vegetarian
            </button>
            <button
              onClick={() => handleSendMessage("Recommended items")}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 border border-slate-700"
            >
              ⭐ Top Rated
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              title="Speak Order (Voice Assistant)"
              className={`p-2.5 rounded-xl transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask menu questions or voice order..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


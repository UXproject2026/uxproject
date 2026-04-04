import { useState, useEffect, useRef } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! 👋 How can I help you with your theatre booking today?", sender: 'bot' }
  ]);
  const [inputValue, setSearchValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setSearchValue('');

    // Mock "Live" response
    setTimeout(() => {
      let botResponse = "That's a great question! One of our team members will be with you shortly. In the meantime, you can check our Help page for FAQs.";
      
      if (inputValue.toLowerCase().includes('ticket')) {
        botResponse = "You can find all your purchased tickets in the 'My Tickets' section at the top of the page!";
      } else if (inputValue.toLowerCase().includes('refund')) {
        botResponse = "Refunds are handled by the specific venue. Please contact the box office of the theatre where the show is playing.";
      }

      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <div className="chat-widget-container" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="chat-bubble-btn"
          style={{
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'var(--primary-lavender)', color: 'white',
            border: 'none', fontSize: '30px', cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" style={{
          width: '320px', height: '450px', background: 'white',
          borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--soft-lavender)'
        }}>
          <header style={{ 
            background: 'var(--primary-lavender)', padding: '15px 20px', 
            color: 'white', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontWeight: 'bold' }}>Theatre Support Live</div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </header>

          <div className="chat-messages" style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? 'var(--primary-lavender)' : '#f0f0f0',
                color: msg.sender === 'user' ? 'white' : 'black',
                padding: '8px 12px', borderRadius: '15px', maxWidth: '80%',
                fontSize: '14px', lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ flex: 1, border: '1px solid #ddd', borderRadius: '20px', padding: '8px 15px', outline: 'none' }}
            />
            <button type="submit" style={{ 
              background: 'var(--primary-lavender)', color: 'white', border: 'none', 
              borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer'
            }}>➔</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

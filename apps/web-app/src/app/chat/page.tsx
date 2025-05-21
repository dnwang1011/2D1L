// Placeholder for Chat View components
// For now, a simple page structure

// Example: Define a simple Message interface for now
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatPage() {
  // Placeholder state and functions
  const messages: Message[] = [
    { id: '1', text: 'Hello there!', sender: 'user', timestamp: new Date(Date.now() - 100000) },
    { id: '2', text: 'Hi! How can I help you today?', sender: 'assistant', timestamp: new Date(Date.now() - 90000) },
    { id: '3', text: 'Tell me about the V4 project.', sender: 'user', timestamp: new Date(Date.now() - 80000) },
    { id: '4', text: 'The V4 project is an advanced knowledge management system... (placeholder)', sender: 'assistant', timestamp: new Date(Date.now() - 70000) },
  ];
  const currentMessage = '';
  // const setCurrentMessage = (value: string) => {};
  // const handleSendMessage = () => {};

  return (
    <div className="flex flex-col h-screen bg-backgroundDark text-textLight">
      {/* Chat Header */}
      <header className="bg-primary p-4 shadow-md">
        <h1 className="text-xl font-semibold">Chat with Dot</h1>
      </header>

      {/* Message List */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${ 
                msg.sender === 'user'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-700 text-textLight'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()} - {msg.sender}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <footer className="bg-primary p-4 shadow-up">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={currentMessage}
            // onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-lg border border-gray-600 bg-gray-700 text-textLight focus:ring-accent focus:border-accent outline-none"
          />
          <button
            // onClick={handleSendMessage}
            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
} 
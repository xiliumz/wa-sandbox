import { ChatContainer } from '@/components/ChatContainer';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex justify-center">
      <div className="w-full max-w-2xl h-full shadow-2xl bg-white">
        <ChatContainer />
      </div>
    </div>
  );
}

export default App;

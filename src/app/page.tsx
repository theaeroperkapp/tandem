import { ChatContainer } from '@/components/chat/ChatContainer';
import { Building2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Tandem</h1>
          <span className="text-sm text-muted-foreground ml-2">
            Office Space Matchmaker
          </span>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}

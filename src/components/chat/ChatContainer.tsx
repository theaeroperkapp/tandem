'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ListingCard } from '@/components/listings/ListingCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message, MatchedListing, Requirements } from '@/types';
import { Building2, Sparkles } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! Looking for office space? Tell me a bit about your team and I'll help you find the perfect spot in SF or NYC. What brings you here today?",
  timestamp: new Date(),
};

export function ChatContainer() {
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tandem_session_id');
      if (stored) return stored;
      const newId = uuidv4();
      localStorage.setItem('tandem_session_id', newId);
      return newId;
    }
    return uuidv4();
  });

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchedListing[]>([]);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, matches]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Check if we should trigger matching
      if (data.triggerMatch && data.requirements) {
        setRequirements(data.requirements.data);
        await fetchMatches(data.requirements.data);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "Sorry, I ran into an issue. Could you try again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async (reqs: Requirements) => {
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: reqs,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);

        // Add message about matches
        const matchMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Great news! I found ${data.matches.length} spaces that match your criteria. Take a look below and let me know if you'd like more details on any of them, or if you want me to generate a lease draft.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, matchMessage]);
      }
    } catch (error) {
      console.error('Match error:', error);
    }
  };

  const handleGenerateLease = async (listingId: string) => {
    if (!requirements) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          requirements,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.leaseDocument) {
        const leaseMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Here's your draft lease agreement:\n\n${data.leaseDocument}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, leaseMessage]);
        // Clear matches to show the lease
        setMatches([]);
      }
    } catch (error) {
      console.error('Lease generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-muted/20 to-background">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Empty state for new conversations */}
          {messages.length === 1 && (
            <div className="text-center py-12 space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Welcome to Tandem</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  I&apos;m your AI office space advisor. Tell me about your team size, budget, and preferred location to get started.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                <QuickPrompt onClick={() => handleSendMessage("We're a 10-person startup looking for space in SF")}>
                  10-person startup in SF
                </QuickPrompt>
                <QuickPrompt onClick={() => handleSendMessage("I need office space for 20 people in NYC, budget around $15k/month")}>
                  20 people in NYC, $15k budget
                </QuickPrompt>
                <QuickPrompt onClick={() => handleSendMessage("Looking for a small office for 5 people, flexible on location")}>
                  Small office for 5 people
                </QuickPrompt>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-1">
            {messages.map((message, index) => (
              <div key={message.id} className={index > 0 ? 'animate-fade-in' : ''}>
                <ChatMessage message={message} />
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-primary/60"></span>
                <span className="typing-dot h-2 w-2 rounded-full bg-primary/60"></span>
                <span className="typing-dot h-2 w-2 rounded-full bg-primary/60"></span>
              </div>
            </div>
          )}

          {/* Matched Listings */}
          {matches.length > 0 && (
            <div className="py-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground px-2">
                  {matches.length} Matches Found
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onGenerateLease={() => handleGenerateLease(listing.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function QuickPrompt({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm rounded-full border bg-background hover:bg-muted transition-colors"
    >
      {children}
    </button>
  );
}

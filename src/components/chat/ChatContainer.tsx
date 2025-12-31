'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ListingCard } from '@/components/listings/ListingCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message, MatchedListing, Requirements } from '@/types';
import { Loader2 } from 'lucide-react';

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
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Chat Messages */}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {/* Matched Listings */}
          {matches.length > 0 && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">Top Matches</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}

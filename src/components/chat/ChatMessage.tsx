'use client';

import { cn } from '@/lib/utils';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Building2, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 py-4 px-2',
        isUser && 'flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          'flex-1 space-y-1 overflow-hidden',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-2xl px-4 py-2.5 max-w-[85%]',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-muted rounded-tl-md'
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-0.5">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { Message, ExtractedRequirements } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Parse JSON from Claude's response
function extractRequirementsFromResponse(content: string): ExtractedRequirements | null {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.requirements_extracted) {
        return parsed as ExtractedRequirements;
      }
    } catch {
      console.error('Failed to parse requirements JSON');
    }
  }
  return null;
}

// Remove JSON block from response for cleaner display
function cleanResponseContent(content: string): string {
  return content.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    const messages: Message[] = conversation?.messages || [];

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    messages.push(userMessage);

    // Prepare messages for Claude (last 10 for context management)
    const recentMessages = messages.slice(-10);
    const claudeMessages = recentMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
      temperature: 0.7,
    });

    const assistantContent = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Extract requirements if present
    const extractedRequirements = extractRequirementsFromResponse(assistantContent);
    const cleanContent = cleanResponseContent(assistantContent);

    // Add assistant message
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: cleanContent,
      timestamp: new Date(),
    };
    messages.push(assistantMessage);

    // Save conversation
    if (conversation) {
      await supabase
        .from('conversations')
        .update({
          messages,
          extracted_requirements: extractedRequirements?.data || conversation.extracted_requirements,
        })
        .eq('session_id', sessionId);
    } else {
      await supabase.from('conversations').insert({
        session_id: sessionId,
        messages,
        extracted_requirements: extractedRequirements?.data,
      });
    }

    // Determine if we should trigger matching
    const shouldTriggerMatch = extractedRequirements &&
      (extractedRequirements.confidenceLevel === 'high' ||
       extractedRequirements.confidenceLevel === 'medium');

    return NextResponse.json({
      message: cleanContent,
      requirements: extractedRequirements,
      triggerMatch: shouldTriggerMatch,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

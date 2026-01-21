'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Minimize2,
  MessageCircle,
  Loader2,
  AlertCircle,
  Key,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content:
        "👋 Hi! I'm your DeFi portfolio assistant. I can help you create triggers, manage jobs, and monitor your portfolio. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'demo' | 'full-user' | 'full-server' | 'langgraph' | null>(
    null,
  );
  const [apiKey, setApiKey] = useState<string>('');
  const [deploymentUrl, setDeploymentUrl] = useState<string>('http://localhost:8123');
  const [graphId, setGraphId] = useState<string>('recurring_executor');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }

    const storedDeploymentUrl = localStorage.getItem('langgraph_deployment_url');
    if (storedDeploymentUrl) {
      setDeploymentUrl(storedDeploymentUrl);
    }

    const storedGraphId = localStorage.getItem('langgraph_graph_id');
    if (storedGraphId) {
      setGraphId(storedGraphId);
    }

    const storedThreadId = localStorage.getItem('langgraph_thread_id');
    if (storedThreadId) {
      setThreadId(storedThreadId);
    }
  }, []);

  // Re-check configuration when widget opens
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }

      const storedDeploymentUrl = localStorage.getItem('langgraph_deployment_url');
      if (storedDeploymentUrl) {
        setDeploymentUrl(storedDeploymentUrl);
      }

      const storedGraphId = localStorage.getItem('langgraph_graph_id');
      if (storedGraphId) {
        setGraphId(storedGraphId);
      }

      const storedThreadId = localStorage.getItem('langgraph_thread_id');
      if (storedThreadId) {
        setThreadId(storedThreadId);
      }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveLangGraphConfig = () => {
    localStorage.setItem('langgraph_deployment_url', deploymentUrl);
    localStorage.setItem('langgraph_graph_id', graphId);
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
    setShowSettings(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/langgraph-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          deploymentUrl: deploymentUrl,
          graphId: graphId,
          threadId: threadId,
          apiKey: apiKey || undefined, // Send API key if they have one
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let agentContent = '';

      // Add placeholder agent message
      const agentMessage: Message = {
        role: 'agent',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'token') {
                    agentContent += data.content;
                    // Update the last message
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'agent') {
                        lastMessage.content = agentContent;
                      }
                      return newMessages;
                    });
                    // Save threadId if provided
                    if (data.threadId && !threadId) {
                      setThreadId(data.threadId);
                      localStorage.setItem('langgraph_thread_id', data.threadId);
                    }
                  } else if (data.type === 'mode') {
                    setMode(data.mode); // Track what mode we're in
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove placeholder
        {
          role: 'agent',
          content: `❌ Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <Card className="flex flex-col w-96 h-[600px] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">Agent Chat</h3>
              <p className="text-xs text-muted-foreground">
                LangGraph-powered assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">LangGraph Configuration</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Deployment URL
                  </label>
                  <Input
                    value={deploymentUrl}
                    onChange={(e) => setDeploymentUrl(e.target.value)}
                    placeholder="http://localhost:2024"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Graph/Assistant ID
                  </label>
                  <Input
                    value={graphId}
                    onChange={(e) => setGraphId(e.target.value)}
                    placeholder="agent"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    API Key (optional)
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="•••••••••••••••••••••••••••••••••••••••••••••••••••"
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  onClick={saveLangGraphConfig}
                  size="sm"
                  className="w-full h-8 text-xs"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}

          {/* Mode Indicator Banner */}
          {mode === 'demo' && (
            <Alert className="m-3 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <strong>Demo Mode</strong> - Simulated responses.{' '}
                <Link href="/settings" className="underline font-medium">
                  Add API key
                </Link>{' '}
                for real AI.
              </AlertDescription>
            </Alert>
          )}

          {!apiKey && !mode && (
            <Alert className="m-3 bg-yellow-50 border-yellow-200">
              <Key className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                <strong>No API Key</strong> - Using demo mode.{' '}
                <Link href="/settings" className="underline font-medium">
                  Add your key
                </Link>{' '}
                for full features.
              </AlertDescription>
            </Alert>
          )}

          {apiKey && mode === 'full-user' && (
            <Alert className="m-3 bg-green-50 border-green-200">
              <Key className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-xs">
                <strong>Full Mode</strong> - Using your API key for unlimited
                queries.
              </AlertDescription>
            </Alert>
          )}

          {mode === 'langgraph' && (
            <Alert className="m-3 bg-blue-50 border-blue-200">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <strong>LangGraph Mode</strong> - Connected to {deploymentUrl} ({graphId})
              </AlertDescription>
            </Alert>
          )}

          {mode === 'demo' && apiKey && (
            <Alert className="m-3 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-xs">
                <strong>Demo Mode</strong> - LangGraph connection failed. Check server configuration and API keys.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: "Create a SOL trigger" or "Show my portfolio"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

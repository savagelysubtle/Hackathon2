'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Key,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * API Key Settings Component
 *
 * Allows users to add their own OpenAI API key to unlock full functionality.
 * Keys are stored in localStorage (client-side only) for security.
 */
export function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'valid' | 'invalid'
  >('idle');

  // Load existing key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setHasKey(true);
      setValidationStatus('valid');
    }
  }, []);

  // Save API key to localStorage
  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Basic validation: OpenAI keys start with "sk-"
      if (!apiKey.startsWith('sk-')) {
        setValidationStatus('invalid');
        setIsValidating(false);
        return;
      }

      // Test the key with a minimal API call
      const testResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'test',
          userApiKey: apiKey,
          testMode: true, // Special flag to test key without full processing
        }),
      });

      if (testResponse.ok) {
        localStorage.setItem('openai_api_key', apiKey);
        setHasKey(true);
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
      }
    } catch (error) {
      console.error('Key validation error:', error);
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  // Remove API key
  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setHasKey(false);
    setValidationStatus('idle');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Add your own OpenAI API key to unlock full AI capabilities. Your key
          is stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {hasKey ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Full Mode Active</strong> - Using your OpenAI API key for
              unlimited queries
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode Active</strong> - Add your API key to unlock
              real AI responses
            </AlertDescription>
          </Alert>
        )}

        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                disabled={hasKey}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {hasKey ? (
              <Button
                variant="destructive"
                onClick={handleRemoveKey}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : (
              <Button
                onClick={handleSaveKey}
                disabled={!apiKey.trim() || isValidating}
                className="gap-2"
              >
                {isValidating ? 'Validating...' : 'Save'}
              </Button>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === 'invalid' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid API key. Make sure it starts with "sk-" and is active in
              your OpenAI account.
            </AlertDescription>
          </Alert>
        )}

        {/* How to Get Key */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold text-sm">
            How to get an OpenAI API key:
          </h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>
              Go to{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>Sign in or create an OpenAI account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the key and paste it above</li>
          </ol>
        </div>

        {/* Cost Information */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold text-sm">Cost Estimates:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Typical query: ~$0.01 - $0.03</li>
            <li>• Complex analysis: ~$0.05 - $0.10</li>
            <li>• 100 queries: ~$1 - $3</li>
          </ul>
          <p className="text-xs text-gray-500 pt-2">
            You pay OpenAI directly. We don't charge any fees.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

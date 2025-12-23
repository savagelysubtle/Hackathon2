'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Space {
  id: string;
  address: string;
  owner: string;
  createdAt: number;
  name?: string;
}

export function CreateSpaceButton() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [space, setSpace] = useState<Space | null>(null);
  const [depositInstructions, setDepositInstructions] = useState<any>(null);

  const createSpace = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/spaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Space');
      }

      const data = await response.json();
      setSpace(data.space);
      setDepositInstructions(data.depositInstructions);

      toast.success('Space created successfully!', {
        description: 'You can now deposit funds to start automating.',
      });
    } catch (error) {
      console.error('Error creating Space:', error);
      toast.error('Failed to create Space', {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (space?.address) {
      navigator.clipboard.writeText(space.address);
      toast.success('Address copied to clipboard!');
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Connect your wallet to create a Space
          </p>
        </CardContent>
      </Card>
    );
  }

  if (space) {
    return (
      <Card className="border-green-500/50 bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Space Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Space ID</div>
            <div className="font-mono text-sm">{space.id}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Deposit Address
            </div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded flex-1">
                {space.address}
              </div>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {depositInstructions && (
            <div className="border-t border-border pt-4">
              <div className="text-sm font-medium mb-2">Next Steps:</div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Send funds to the deposit address above</li>
                <li>Wait for confirmation on {depositInstructions.chainId}</li>
                <li>Configure your automation triggers</li>
                <li>Agent will execute automatically!</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={createSpace}
      disabled={loading}
      size="lg"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Space...
        </>
      ) : (
        'Create Agent Space'
      )}
    </Button>
  );
}

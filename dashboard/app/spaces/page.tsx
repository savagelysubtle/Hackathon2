'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreateSpaceButton } from '@/components/spaces/create-space-button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, History, Users } from 'lucide-react';

export default function SpacePage() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Warden Space Setup</h1>
        <p className="text-muted-foreground">
          Create an on-chain smart account for automated execution
        </p>
      </div>

      {/* What is a Space */}
      <Card>
        <CardHeader>
          <CardTitle>What is a Warden Space?</CardTitle>
          <CardDescription>
            A Space is an on-chain smart account that allows your agent to execute transactions automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Auto-Execution</div>
                <div className="text-sm text-muted-foreground">
                  Agent can execute without approval for each transaction
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Secure & Auditable</div>
                <div className="text-sm text-muted-foreground">
                  All actions recorded on Warden blockchain
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Multi-Sig Support</div>
                <div className="text-sm text-muted-foreground">
                  Optional multi-signature for added security
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Full History</div>
                <div className="text-sm text-muted-foreground">
                  Complete audit trail of all agent actions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compare Options */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">Option 1</Badge>
            <CardTitle className="mt-2">Wallet Connect</CardTitle>
            <CardDescription>
              Standard Web3 approach - approve each transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Industry standard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Non-custodial</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">⚠</span>
                <span>Requires signing each transaction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">⚠</span>
                <span>Can't execute while offline</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <Badge className="w-fit">Option 2 (Recommended)</Badge>
            <CardTitle className="mt-2">Warden Space</CardTitle>
            <CardDescription>
              On-chain smart account with automated execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Fully automated execution</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Works 24/7 without interaction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>On-chain audit trail</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Perfect for Warden hackathon!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Create Space Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Space</CardTitle>
          <CardDescription>
            Set up your on-chain smart account to enable automated execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Connect your wallet to create a Space
              </p>
              <ConnectButton />
            </div>
          ) : (
            <CreateSpaceButton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}


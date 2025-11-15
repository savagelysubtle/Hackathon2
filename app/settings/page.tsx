"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { ApiKeySettings } from "@/components/ApiKeySettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure agent parameters and preferences
        </p>
      </div>

      {/* API Key Settings - First for visibility */}
      <ApiKeySettings />

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Allocation</label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">ETH %</label>
                <input
                  type="number"
                  defaultValue={60}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">USDC %</label>
                <input
                  type="number"
                  defaultValue={40}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Drift Threshold</label>
            <input
              type="number"
              defaultValue={5}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
            <p className="text-xs text-muted-foreground">
              Percentage drift before rebalance triggers
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rebalance Schedule</label>
            <input
              type="text"
              defaultValue="0 10 * * 0"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Cron expression (Every Sunday at 10:00 AM)
            </p>
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">RPC Endpoint</label>
            <input
              type="text"
              defaultValue="https://rpc.example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Oracle API Status</label>
            <Badge variant="default" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Connected
            </Badge>
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Agent Service</div>
              <div className="text-sm text-muted-foreground">
                Background service status
              </div>
            </div>
            <Badge variant="default" className="gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Running
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Stop Agent</Button>
            <Button variant="outline">Restart Agent</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


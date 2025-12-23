'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTriggerModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTriggerModalProps) {
  const [formData, setFormData] = useState({
    currencyPair: 'SOL/USD',
    thresholdPercentage: 15,
    actionPercentage: 10,
    direction: 'above' as 'above' | 'below',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (
      formData.thresholdPercentage <= 0 ||
      formData.thresholdPercentage > 100
    ) {
      newErrors.thresholdPercentage = 'Threshold must be between 1 and 100';
    }

    if (formData.actionPercentage <= 0 || formData.actionPercentage > 100) {
      newErrors.actionPercentage =
        'Action percentage must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create trigger');
      }

      const result = await response.json();

      toast.success('Trigger created successfully!', {
        description: `Created ${formData.currencyPair} trigger: ${formData.direction === 'above' ? 'Sell' : 'Buy'} ${formData.actionPercentage}% at ${formData.direction} ${formData.thresholdPercentage}%`,
      });

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        currencyPair: 'SOL/USD',
        thresholdPercentage: 15,
        actionPercentage: 10,
        direction: 'above',
        name: '',
      });
    } catch (error: any) {
      toast.error('Failed to create trigger', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Price Trigger</DialogTitle>
          <DialogDescription>
            Set up an automatic trade trigger based on price movements
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="currencyPair">Currency Pair</Label>
            <Select
              value={formData.currencyPair}
              onValueChange={(value) =>
                setFormData({ ...formData, currencyPair: value })
              }
            >
              <SelectTrigger id="currencyPair">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                <SelectItem value="AVAX/USD">AVAX/USD</SelectItem>
                <SelectItem value="MATIC/USD">MATIC/USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="thresholdPercentage">Threshold (%)</Label>
            <Input
              id="thresholdPercentage"
              type="number"
              min="1"
              max="100"
              value={formData.thresholdPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thresholdPercentage: Number(e.target.value),
                })
              }
              className={errors.thresholdPercentage ? 'border-red-500' : ''}
            />
            {errors.thresholdPercentage && (
              <p className="text-sm text-red-500">
                {errors.thresholdPercentage}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Trigger when price moves this percentage from baseline
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Direction</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.direction === 'above'}
                  onChange={() =>
                    setFormData({ ...formData, direction: 'above' })
                  }
                  className="cursor-pointer"
                />
                <span>Above (Pump) 📈</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.direction === 'below'}
                  onChange={() =>
                    setFormData({ ...formData, direction: 'below' })
                  }
                  className="cursor-pointer"
                />
                <span>Below (Dump) 📉</span>
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actionPercentage">
              Action: {formData.direction === 'above' ? 'Sell' : 'Buy'} (%)
            </Label>
            <Input
              id="actionPercentage"
              type="number"
              min="1"
              max="100"
              value={formData.actionPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actionPercentage: Number(e.target.value),
                })
              }
              className={errors.actionPercentage ? 'border-red-500' : ''}
            />
            {errors.actionPercentage && (
              <p className="text-sm text-red-500">{errors.actionPercentage}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Percentage of asset to{' '}
              {formData.direction === 'above' ? 'sell' : 'buy'} when triggered
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Trigger Name (Optional)</Label>
            <Input
              id="name"
              placeholder="e.g., SOL 15% Pump Sell"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <p className="text-sm text-muted-foreground">
              {formData.direction === 'above' ? 'Sell' : 'Buy'}{' '}
              {formData.actionPercentage}% of{' '}
              {formData.currencyPair.split('/')[0]} when price moves{' '}
              {formData.thresholdPercentage}% {formData.direction} baseline
              price
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Trigger'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

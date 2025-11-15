'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EditTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trigger: {
    id: string;
    currencyPair: string;
    baselinePrice: number;
    thresholdPercentage: number;
    actionPercentage: number;
    direction: 'above' | 'below';
    isActive: boolean;
  };
}

export function EditTriggerModal({
  isOpen,
  onClose,
  onSuccess,
  trigger,
}: EditTriggerModalProps) {
  const [formData, setFormData] = useState({
    thresholdPercentage: trigger.thresholdPercentage,
    actionPercentage: trigger.actionPercentage,
    isActive: trigger.isActive,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData({
      thresholdPercentage: trigger.thresholdPercentage,
      actionPercentage: trigger.actionPercentage,
      isActive: trigger.isActive,
    });
  }, [trigger]);

  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/triggers/${trigger.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update trigger');
      }

      toast.success('Trigger updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update trigger', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/triggers/${trigger.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete trigger');
      }

      toast.success('Trigger deleted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to delete trigger', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/triggers/${trigger.id}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset trigger');
      }

      toast.success('Trigger reset successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to reset trigger', {
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
          <DialogTitle>Edit Trigger</DialogTitle>
          <DialogDescription>
            Modify trigger settings for {trigger.currencyPair}
          </DialogDescription>
        </DialogHeader>

        {!showDeleteConfirm ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Currency Pair</Label>
                <div className="rounded-md border px-3 py-2 bg-muted">
                  {trigger.currencyPair}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Baseline Price</Label>
                <div className="rounded-md border px-3 py-2 bg-muted">
                  ${trigger.baselinePrice.toFixed(2)}
                </div>
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
                    setFormData({ ...formData, thresholdPercentage: Number(e.target.value) })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actionPercentage">
                  Action: {trigger.direction === 'above' ? 'Sell' : 'Buy'} (%)
                </Label>
                <Input
                  id="actionPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.actionPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, actionPercentage: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Reset Trigger
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Are you sure you want to delete this trigger?
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                This action cannot be undone.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Trigger'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


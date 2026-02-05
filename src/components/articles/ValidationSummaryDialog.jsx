import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from './StarRating';
import { CheckCircle } from 'lucide-react';

export default function ValidationSummaryDialog({ open, onOpenChange, onConfirm, isLoading }) {
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState(0);

  const handleConfirm = () => {
    onConfirm({ summary, rating });
    setSummary('');
    setRating(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Validation</DialogTitle>
          <DialogDescription>
            Provide a summary of changes made and rate the article quality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Quality Rating</Label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Changes Summary</Label>
            <Textarea
              id="summary"
              placeholder="Describe the changes made during this validation (e.g., 'Updated resolution steps for clarity, fixed typo in cause section')"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || rating === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Validating...' : 'Confirm Validation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
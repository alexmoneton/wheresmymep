'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/ui/dialog';
import { Bell, CheckCircle } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface CreateAlertModalProps {
  children: React.ReactNode;
  prefilledTopic?: string;
}

export function CreateAlertModal({ children, prefilledTopic }: CreateAlertModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(prefilledTopic || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !topic) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check usage limit first
      const usageResponse = await fetch('/api/usage/alert');
      const usageData = await usageResponse.json();
      
      if (usageData.remaining === 0) {
        setShowUpgradeModal(true);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/alerts/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          topic,
          path: pathname,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Increment usage after successful submission
        await fetch('/api/usage/alert', { method: 'POST' });
        
        setIsSubmitted(true);
        // Announce success to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Alert interest submitted successfully. We will email you when alerts are ready.';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      } else {
        setError(data.error || 'Failed to submit alert interest');
      }
    } catch {
      setError('Failed to submit alert interest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after a delay to allow for smooth transition
    setTimeout(() => {
      setEmail('');
      setTopic(prefilledTopic || '');
      setIsSubmitted(false);
      setError(null);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-md"
          onKeyDown={handleKeyDown}
        >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>Create Alert</span>
          </DialogTitle>
          <DialogDescription>
            Get notified when we launch email alerts for MEP activity and voting patterns.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thanks!
            </h3>
            <p className="text-gray-600 mb-4">
              We&apos;ll email you when alerts are ready.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic of Interest *
              </label>
              <Input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Climate change votes, Attendance tracking"
                required
                className="w-full"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
    
    <UpgradeModal
      open={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      reason="alerts"
    />
    </>
  );
}
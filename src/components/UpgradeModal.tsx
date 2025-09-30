'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/ui/dialog'
import { Button } from '@/components/shadcn/ui/button'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'
import { Crown, Mail, ExternalLink, MessageCircle } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason: 'alerts' | 'csv'
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/billing/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reason,
          path: window.location.pathname,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error('Failed to submit interest')
      }
    } catch (error) {
      console.error('Error submitting interest:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPricingHref = () => {
    return pathname.startsWith('/ai-act') ? '/ai-act/pricing' : '/pricing'
  }

  const handleSeePricing = () => {
    router.push(getPricingHref())
    onClose()
  }

  const handleTalkToUs = () => {
    window.open('mailto:alex@moneton.no', '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Free Plan Limit Reached
          </DialogTitle>
          <DialogDescription>
            Free plan includes 3 alerts and 3 CSV exports per month. Go Pro for unlimited + weekly digests.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!email || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Notify me when Pro is ready
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSeePricing}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                See pricing plans
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleTalkToUs}
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Talk to us
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <Mail className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Thanks for your interest!</p>
              <p className="text-sm text-gray-600">
                We'll notify you when Pro features are available.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

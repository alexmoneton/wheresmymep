'use client';

import { Button } from '@/components/shadcn/ui/button';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { Bell } from 'lucide-react';

interface CreateAlertButtonProps {
  mepName: string;
  mepId: string;
  className?: string;
}

export function CreateAlertButton({ mepName, mepId, className }: CreateAlertButtonProps) {
  const topic = `MEP ${mepName} – voting updates`;

  return (
    <CreateAlertModal prefilledTopic={topic}>
      <Button 
        variant="outline" 
        size="sm" 
        className={`flex items-center space-x-2 ${className || ''}`}
      >
        <Bell className="h-4 w-4" />
        <span>Create alert</span>
      </Button>
    </CreateAlertModal>
  );
}

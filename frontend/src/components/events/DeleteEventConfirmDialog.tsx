import { useState } from 'react';
import { useDeleteEvent } from '../../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteEventConfirmDialogProps {
  eventId: bigint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteEventConfirmDialog({
  eventId,
  open,
  onOpenChange,
}: DeleteEventConfirmDialogProps) {
  const [error, setError] = useState('');
  const deleteEvent = useDeleteEvent();

  const handleConfirm = async () => {
    if (eventId === null) return;
    setError('');

    try {
      await deleteEvent.mutateAsync(eventId);
      onOpenChange(false);
    } catch (err: any) {
      const msg: string = err?.message ?? 'Failed to delete event';
      if (msg.includes('accepted bookings')) {
        setError('This event cannot be deleted because a booking has been accepted.');
      } else if (msg.includes('Only the event owner')) {
        setError('You are not authorized to delete this event.');
      } else {
        setError(msg);
      }
    }
  };

  const isDeleting = deleteEvent.isPending;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Event?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Are you sure you want to delete this event? This action cannot be undone.
            </span>
            <span className="block text-amber-700 bg-amber-50 px-3 py-2 rounded-md text-sm font-medium">
              ⚠️ All pending booking requests associated with this event will also be deleted.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md mx-1">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Event'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

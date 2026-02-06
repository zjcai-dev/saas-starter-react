import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Plan = {
    id: number;
    name: string;
    tenants_count: number;
};

type DeletePlanDialogProps = {
    plan: Plan | null;
    onOpenChange: () => void;
};

export default function DeletePlanDialog({
    plan,
    onOpenChange,
}: DeletePlanDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!plan) return;

        setIsDeleting(true);
        router.delete(`/plans/${plan.id}`, {
            onSuccess: () => {
                onOpenChange();
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <Dialog open={!!plan} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle>Delete Plan</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete the plan{' '}
                        <span className="font-semibold">{plan?.name}</span>?
                    </DialogDescription>
                </DialogHeader>

                {plan && plan.tenants_count > 0 && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">
                            <strong>Warning:</strong> This plan has{' '}
                            {plan.tenants_count} active tenant(s). You cannot delete
                            a plan with active tenants.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onOpenChange}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || (plan?.tenants_count ?? 0) > 0}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

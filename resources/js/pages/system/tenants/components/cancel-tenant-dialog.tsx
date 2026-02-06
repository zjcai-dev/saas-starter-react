import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Tenant = {
    id: string;
    name: string;
};

type CancelTenantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
};

export default function CancelTenantDialog({
    open,
    onOpenChange,
    tenant,
}: CancelTenantDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleCancel = () => {
        if (!tenant) return;

        setProcessing(true);
        router.post(`/tenants/${tenant.id}/cancel`, {}, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <DialogTitle>Cancel Tenant Subscription</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogDescription className="space-y-3 pt-2">
                    <p>
                        Are you sure you want to cancel the subscription for{' '}
                        <span className="font-semibold text-foreground">{tenant?.name}</span>?
                    </p>
                    <div className="rounded-md bg-muted p-3 text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                            <li>The tenant will be deactivated immediately.</li>
                            <li>A <strong>30-day grace period</strong> will start.</li>
                            <li>The data will be permanently deleted after the grace period ends.</li>
                            <li>You can restore the tenant anytime during the grace period.</li>
                        </ul>
                    </div>
                </DialogDescription>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Keep Active
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={processing}
                    >
                        {processing ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

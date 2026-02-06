import { router } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
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

type RestoreTenantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
};

export default function RestoreTenantDialog({
    open,
    onOpenChange,
    tenant,
}: RestoreTenantDialogProps) {
    const [processing, setProcessing] = useState(false);

    const handleRestore = () => {
        if (!tenant) return;

        setProcessing(true);
        router.post(`/tenants/${tenant.id}/restore`, {}, {
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                            <RefreshCw className="h-5 w-5 text-green-600" />
                        </div>
                        <DialogTitle>Restore Tenant</DialogTitle>
                    </div>
                    <DialogDescription>
                        This will check if the grace period is still valid and restore access for{' '}
                        <span className="font-semibold">{tenant?.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleRestore}
                        disabled={processing}
                    >
                        {processing ? 'Restoring...' : 'Confirm Restore'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

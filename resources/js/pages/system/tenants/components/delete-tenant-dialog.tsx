import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Tenant = {
    id: string;
    name: string;
};

type DeleteTenantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
};

export default function DeleteTenantDialog({
    open,
    onOpenChange,
    tenant,
}: DeleteTenantDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const handleDelete = () => {
        if (!tenant || confirmName !== tenant.name) return;

        setProcessing(true);
        router.delete(`/tenants/${tenant.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setConfirmName('');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle>Delete Tenant Permanently</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogDescription className="space-y-3">
                    <p className="text-destructive font-semibold">
                        Warning: This action is irreversible.
                    </p>
                    <p>
                        This will permanently delete the tenant{' '}
                        <span className="font-semibold text-foreground">{tenant?.name}</span>, including:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-sm bg-muted rounded-md p-3">
                        <li>The tenant database and all its data.</li>
                        <li>All associated user accounts and files.</li>
                        <li>The subdomain configuration.</li>
                    </ul>
                </DialogDescription>

                <div className="space-y-2 pt-2">
                    <Label htmlFor="confirm-name">
                        Type <span className="font-mono font-bold select-all">{tenant?.name}</span> to confirm
                    </Label>
                    <Input
                        id="confirm-name"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder="Type tenant name to confirm"
                    />
                </div>

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
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing || confirmName !== tenant?.name}
                    >
                        {processing ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

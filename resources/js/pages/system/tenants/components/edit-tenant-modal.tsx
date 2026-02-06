import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
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
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Tenant = {
    id: string;
    name: string;
    owner_name: string;
    owner_email: string;
    status: string;
};

type EditTenantModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
};

export default function EditTenantModal({
    open,
    onOpenChange,
    tenant,
}: EditTenantModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        owner_name: '',
        owner_email: '',
        status: '',
    });

    useEffect(() => {
        if (tenant) {
            setData({
                owner_name: tenant.owner_name,
                owner_email: tenant.owner_email,
                status: tenant.status,
            });
        }
    }, [tenant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        put(`/tenants/${tenant.id}`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Tenant: {tenant?.name}</DialogTitle>
                    <DialogDescription>
                        Update tenant basic information and status.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="owner_name">Owner Name</Label>
                        <Input
                            id="owner_name"
                            value={data.owner_name}
                            onChange={(e) => setData('owner_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.owner_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="owner_email">Owner Email</Label>
                        <Input
                            id="owner_email"
                            type="email"
                            value={data.owner_email}
                            onChange={(e) => setData('owner_email', e.target.value)}
                            required
                        />
                        <InputError message={errors.owner_email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Trial">Trial</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Note: Canceled status is handled via the separate Cancel action.
                        </p>
                        <InputError message={errors.status} />
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
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

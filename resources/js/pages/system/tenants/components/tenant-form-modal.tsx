import { useForm } from '@inertiajs/react';
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

type Plan = {
    id: number;
    name: string;
    price_formatted: string;
};

type TenantFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plans: Plan[];
};

export default function TenantFormModal({
    open,
    onOpenChange,
    plans,
}: TenantFormModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        domain: '',
        owner_name: '',
        owner_email: '',
        owner_password: '', 
        owner_password_confirmation: '',
        plan_id: '',
        status: 'Active', // Default status
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tenants', {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Tenant</DialogTitle>
                    <DialogDescription>
                        Create a new tenant workspace with a dedicated database and domain.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Tenant Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Tenant Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Acme Corp"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Domain */}
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain (Subdomain) *</Label>
                            <div className="flex">
                                <Input
                                    id="domain"
                                    value={data.domain}
                                    onChange={(e) => setData('domain', e.target.value)}
                                    placeholder="acme"
                                    className="rounded-r-none"
                                    required
                                />
                                <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                                    .{window.location.hostname}
                                </div>
                            </div>
                            <InputError message={errors.domain} />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Owner Information</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="owner_name">Owner Name *</Label>
                                <Input
                                    id="owner_name"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                <InputError message={errors.owner_name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_email">Owner Email *</Label>
                                <Input
                                    id="owner_email"
                                    type="email"
                                    value={data.owner_email}
                                    onChange={(e) => setData('owner_email', e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                                <InputError message={errors.owner_email} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="owner_password">Password *</Label>
                                <Input
                                    id="owner_password"
                                    type="password"
                                    value={data.owner_password}
                                    onChange={(e) => setData('owner_password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.owner_password} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_password_confirmation">Confirm Password *</Label>
                                <Input
                                    id="owner_password_confirmation"
                                    type="password"
                                    value={data.owner_password_confirmation}
                                    onChange={(e) => setData('owner_password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                        <div className="space-y-2">
                             <Label htmlFor="plan_id">Plan *</Label>
                            <Select
                                value={data.plan_id}
                                onValueChange={(value) => setData('plan_id', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                            {plan.name} ({plan.price_formatted})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.plan_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Initial Status</Label>
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
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
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
                            {processing ? 'Creating...' : 'Create Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

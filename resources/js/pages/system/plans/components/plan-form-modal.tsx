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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    duration_in_days: number;
    is_free: boolean;
    is_active: boolean;
};

type PlanFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: Plan | null;
};

export default function PlanFormModal({
    open,
    onOpenChange,
    plan,
}: PlanFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'USD',
        duration_in_days: 30,
        is_free: false,
        is_active: true,
    });

    // Load plan data when editing
    useEffect(() => {
        if (plan) {
            setData({
                name: plan.name,
                slug: plan.slug,
                description: plan.description,
                price: plan.price,
                currency: plan.currency,
                duration_in_days: plan.duration_in_days,
                is_free: plan.is_free,
                is_active: plan.is_active,
            });
        } else {
            reset();
        }
    }, [plan]);

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setData('name', value);
        if (!plan) {
            // Only auto-generate slug when creating new plan
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (plan) {
            put(`/plans/${plan.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post('/plans', {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {plan ? 'Edit Plan' : 'Create New Plan'}
                    </DialogTitle>
                    <DialogDescription>
                        {plan
                            ? 'Update the plan details below'
                            : 'Fill in the details to create a new plan'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g., Professional"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="e.g., professional"
                                required
                            />
                            <InputError message={errors.slug} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the plan"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Price *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', parseFloat(e.target.value))
                                }
                                required
                                disabled={data.is_free}
                            />
                            <InputError message={errors.price} />
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency *</Label>
                            <Input
                                id="currency"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                placeholder="USD"
                                required
                            />
                            <InputError message={errors.currency} />
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (days) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="1"
                                value={data.duration_in_days}
                                onChange={(e) =>
                                    setData('duration_in_days', parseInt(e.target.value))
                                }
                                required
                            />
                            <InputError message={errors.duration_in_days} />
                        </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_free">Free Plan</Label>
                                <p className="text-sm text-muted-foreground">
                                    Mark this plan as free (price will be set to 0)
                                </p>
                            </div>
                            <Switch
                                id="is_free"
                                checked={data.is_free}
                                onCheckedChange={(checked) => {
                                    setData('is_free', checked);
                                    if (checked) {
                                        setData('price', 0);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Make this plan available for new subscriptions
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked)
                                }
                            />
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
                            {processing
                                ? 'Saving...'
                                : plan
                                  ? 'Update Plan'
                                  : 'Create Plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

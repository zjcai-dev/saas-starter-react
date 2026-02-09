import { useEffect } from 'react';
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
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface UserFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export default function UserFormModal({
    open,
    onOpenChange,
    user,
}: UserFormModalProps) {
    const isEditing = !!user;

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (open) {
            form.reset();
            form.clearErrors();
            if (user) {
                form.setData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    password_confirmation: '',
                });
            }
        }
    }, [open, user]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && user) {
            form.patch(route('tenant.users.update', user.id), {
                onSuccess: () => {
                    toast.success('User updated successfully');
                    onOpenChange(false);
                },
            });
        } else {
            form.post(route('tenant.users.store'), {
                onSuccess: () => {
                    toast.success('User created successfully');
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Create User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update user details here. Click save when you\'re done.'
                            : 'Add a new user to your workspace.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="john@example.com"
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {isEditing ? 'Password (Optional)' : 'Password'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            placeholder={isEditing ? 'Leave empty to keep current' : 'Enter password'}
                            required={!isEditing}
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData('password_confirmation', e.target.value)
                            }
                            placeholder="Confirm password"
                            required={!isEditing || !!form.data.password}
                        />
                        <InputError message={form.errors.password_confirmation} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {isEditing ? 'Save changes' : 'Create user'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

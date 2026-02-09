import { useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import TenantAppLayout from '@/layouts/tenant-app-layout';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { toast } from 'sonner';

interface SmtpProps {
    smtp_host: string;
    smtp_port: string;
    smtp_encryption: string;
    smtp_username: string;
    smtp_from_address: string;
    smtp_from_name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMTP settings',
        href: '/tenant/settings/smtp',
    },
];

export default function Smtp({
    smtp_host,
    smtp_port,
    smtp_encryption,
    smtp_username,
    smtp_from_address,
    smtp_from_name,
}: SmtpProps) {
    const { auth } = usePage<SharedData>().props;

    const form = useForm({
        smtp_host: smtp_host || '',
        smtp_port: smtp_port || '',
        smtp_encryption: smtp_encryption || 'tls',
        smtp_username: smtp_username || '',
        smtp_password: '',
        smtp_from_address: smtp_from_address || '',
        smtp_from_name: smtp_from_name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('tenant.settings.smtp.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('SMTP settings updated successfully');
                form.reset('smtp_password');
            },
        });
    };

    const sendTestEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        // We use a separate form or simple post request for testing
        // to avoid validating the main form if it's not ready
        // But here we want to save AND test usually, or test current settings.
        // The backend test() method uses stored settings.
        // So we should probably save first? 
        // Or maybe just call test endpoint.
        
        // Let's call the test endpoint directly
        // Note: The backend uses stored settings, so user must save first.
        // We can warn them or just let it fail if not saved.
        
        // Use inertia router manually or create a temporary form
        // Using form helper for loading state might be useful
        // But we have the main form...
        // Let's use a separate Inertia visit
        
        // Actually, let's use the form helper to post to test route
        // so we get processing state, but we don't want to send form data necessarily
        // if the backend uses stored settings.
        // The Vue implementation used `router.post`.
        
        // In React with Inertia, we can use `router.post`.
        // Let's import router (it's exported from @inertiajs/react as router?)
        // Wait, useForm has post. 
        // Let's use a separate useForm for the test button to track its own processing state.
    };
    
    // Separate form for test email to track processing state independently
    const testForm = useForm({});

    const handleTestEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        testForm.post(route('tenant.settings.smtp.test'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Test email sent to ${auth.user.email}`);
            },
            onError: (errors) => {
                toast.error('Failed to send test email');
            }
        });
    };

    return (
        <TenantAppLayout breadcrumbs={breadcrumbs}>
            <TenantSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="SMTP Settings"
                        description="Configure your email server settings"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input
                                id="smtp_host"
                                className="mt-1 block w-full"
                                value={form.data.smtp_host}
                                onChange={(e) => form.setData('smtp_host', e.target.value)}
                                required
                                placeholder="smtp.example.com"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_host} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input
                                id="smtp_port"
                                className="mt-1 block w-full"
                                value={form.data.smtp_port}
                                onChange={(e) => form.setData('smtp_port', e.target.value)}
                                required
                                placeholder="587"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_port} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_encryption">Encryption</Label>
                            <Select
                                value={form.data.smtp_encryption}
                                onValueChange={(value) => form.setData('smtp_encryption', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select encryption" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tls">TLS</SelectItem>
                                    <SelectItem value="ssl">SSL</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError className="mt-2" message={form.errors.smtp_encryption} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_username">Username</Label>
                            <Input
                                id="smtp_username"
                                className="mt-1 block w-full"
                                value={form.data.smtp_username}
                                onChange={(e) => form.setData('smtp_username', e.target.value)}
                                required
                                placeholder="username@example.com"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_password">Password</Label>
                            <Input
                                id="smtp_password"
                                type="password"
                                className="mt-1 block w-full"
                                value={form.data.smtp_password}
                                onChange={(e) => form.setData('smtp_password', e.target.value)}
                                placeholder="Leave empty to keep current password"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_from_address">From Address</Label>
                            <Input
                                id="smtp_from_address"
                                type="email"
                                className="mt-1 block w-full"
                                value={form.data.smtp_from_address}
                                onChange={(e) => form.setData('smtp_from_address', e.target.value)}
                                required
                                placeholder="noreply@example.com"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_from_address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smtp_from_name">From Name</Label>
                            <Input
                                id="smtp_from_name"
                                className="mt-1 block w-full"
                                value={form.data.smtp_from_name}
                                onChange={(e) => form.setData('smtp_from_name', e.target.value)}
                                required
                                placeholder="My App"
                            />
                            <InputError className="mt-2" message={form.errors.smtp_from_name} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={form.processing}>Save</Button>

                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={handleTestEmail}
                                disabled={testForm.processing}
                            >
                                {testForm.processing ? 'Sending...' : 'Test Email'}
                            </Button>

                            <Transition
                                show={form.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Saved.
                                </p>
                            </Transition>
                            
                            <Transition
                                show={testForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Email sent.
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </TenantSettingsLayout>
        </TenantAppLayout>
    );
}

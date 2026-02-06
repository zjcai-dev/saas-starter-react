import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Ensure Switch is available or use the checkbox hack
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Guest Registration Settings',
        href: '/settings/guest-register',
    },
];

interface Props {
    guest_registration_enabled: boolean;
}

export default function GuestRegisterSettings({ guest_registration_enabled }: Props) {
    const [enabled, setEnabled] = useState(guest_registration_enabled);

    const toggleGuestRegistration = (checked: boolean) => {
        setEnabled(checked);
        router.post(
            '/settings/guest-register',
            { enabled: checked },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setEnabled(!checked); // Revert on error
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guest Registration Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="Guest Registration"
                        description="Allow new users to self-register as tenants from the central domain"
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div className="space-y-0.5 flex-1">
                                <Label htmlFor="guest-registration" className="text-base font-medium">
                                    Enable public registration
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    When enabled, visitors can register at{' '}
                                    <code className="bg-muted px-1 rounded text-xs">/guest-register</code>{' '}
                                    and automatically get a subdomain with a free plan.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Switch
                                    id="guest-registration"
                                    checked={enabled}
                                    onCheckedChange={toggleGuestRegistration}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="mb-2 font-medium">Registration URLs:</p>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>
                                    • <strong>Enabled:</strong>{' '}
                                    <code className="bg-background px-1 rounded">/guest-register</code>
                                </li>
                                <li>
                                    • <strong>Disabled:</strong>{' '}
                                    <code className="bg-background px-1 rounded">/guest-register/disabled</code>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import TenantAppLayout from '@/layouts/tenant-app-layout';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';

export default function Appearance() {
    return (
        <TenantAppLayout breadcrumbs={[
            { title: 'Appearance settings', href: '/settings/appearance' }
        ]}>
            <Head title="Appearance settings" />

            <TenantSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </div>
            </TenantSettingsLayout>
        </TenantAppLayout>
    );
}

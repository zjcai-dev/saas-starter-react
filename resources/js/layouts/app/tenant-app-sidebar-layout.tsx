import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { TenantAppSidebar } from '@/components/tenant-app-sidebar';
import { TenantAppSidebarHeader } from '@/components/tenant-app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function TenantAppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <TenantAppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <TenantAppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}

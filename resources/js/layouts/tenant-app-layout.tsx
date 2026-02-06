import TenantAppSidebarLayout from '@/layouts/app/tenant-app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <TenantAppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
    </TenantAppSidebarLayout>
);

import {
    type BreadcrumbItem,
    type NavItem,
    type SharedData,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { Lock, User } from 'lucide-react';
import TenantAppSidebarLayout from '@/layouts/app/tenant-app-sidebar-layout';

export default function TenantSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url } = usePage<SharedData>();

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: '/settings/profile',
            icon: null,
        },
        {
            title: 'Password',
            href: '/settings/password',
            icon: null,
        },
        {
            title: 'Appearance',
            href: '/settings/appearance',
            icon: null,
        },
    ];

    return (
        <TenantAppSidebarLayout breadcrumbs={[]}>
            <div className="flex flex-1 flex-col space-y-8 p-8 md:flex-row md:space-x-12 md:space-y-0">
                <aside className="w-full md:w-1/5">
                    <nav
                        className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1"
                        aria-label="Sidebar"
                    >
                        {sidebarNavItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                                    url.startsWith(item.href)
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {item.title}
                            </a>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
        </TenantAppSidebarLayout>
    );
}

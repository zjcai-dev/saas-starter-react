import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    MoreHorizontal,
    Plus,
    Search,
    Pencil,
    Ban,
    RefreshCw,
    Trash2,
    Users,
    ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Components
import TenantFormModal from './components/tenant-form-modal';
import EditTenantModal from './components/edit-tenant-modal';
import CancelTenantDialog from './components/cancel-tenant-dialog';
import RestoreTenantDialog from './components/restore-tenant-dialog';
import DeleteTenantDialog from './components/delete-tenant-dialog';

// Types
type Plan = {
    id: number;
    name: string;
    price_formatted: string;
};

type Tenant = {
    id: string;
    name: string;
    tenancy_db_name: string;
    owner_name: string;
    owner_email: string;
    status: 'Trial' | 'Active' | 'Suspended' | 'Canceled';
    status_badge: 'default' | 'secondary' | 'destructive' | 'outline';
    is_active: boolean;
    plan?: Plan;
    domain?: string;
    domain_url?: string;
    grace_period_days?: number;
    can_restore: boolean;
    can_delete: boolean;
    created_at: string;
};

type PageProps = {
    tenants: {
        data: Tenant[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        active: number;
        trial: number;
        canceled: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    plans: Plan[]; // For the create modal
    flash: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs = [
    {
        title: 'Tenants',
        href: '/tenants',
    },
];

export default function TenantsIndex() {
    const { tenants, stats, filters, plans, flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status?.toLowerCase() || 'all');
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [cancelingTenant, setCancelingTenant] = useState<Tenant | null>(null);
    const [restoringTenant, setRestoringTenant] = useState<Tenant | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearch(value);
        if (value === '') {
            router.get('/tenants', { ...filters, search: undefined }, { preserveState: true, replace: true });
        }
    };

    // Debounce search
    useEffect(() => {
        if (search === filters.search) return;
        
        const timeoutId = setTimeout(() => {
            router.get('/tenants', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        
        const params: any = { search: search || undefined };
        
        if (value !== 'all') {
            // Capitalize first letter for status enum
            params.status = value.charAt(0).toUpperCase() + value.slice(1);
        }

        router.get('/tenants', params, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenants" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Tenants</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your application workspaces
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Tenant
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Active</p>
                            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Trial</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.trial}</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Canceled</p>
                            <p className="text-3xl font-bold text-red-600">{stats.canceled}</p>
                        </div>
                    </div>
                </div>

                {/* Filters and Table */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card md:min-h-min">
                    <div className="p-6 space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Tabs value={activeTab} onValueChange={handleTabChange}>
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="trial">Trial</TabsTrigger>
                                    <TabsTrigger value="suspended">Suspended</TabsTrigger>
                                    <TabsTrigger value="canceled">Canceled</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search tenants..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No tenants found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tenants.data.map((tenant) => (
                                            <TableRow key={tenant.id}>


                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{tenant.name}</div>
                                                        {tenant.domain_url ? (
                                                            <a 
                                                                href={tenant.domain_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                            >
                                                                {tenant.domain}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {tenant.domain || 'No domain'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{tenant.owner_name}</div>
                                                        <div className="text-sm text-muted-foreground">{tenant.owner_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {tenant.plan ? (
                                                        <Badge variant="outline">{tenant.plan.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={tenant.status_badge as any}>
                                                        {tenant.status}
                                                    </Badge>
                                                    {tenant.status === 'Canceled' && tenant.grace_period_days != null && (
                                                        <div className="text-xs text-orange-600 mt-1 font-medium">
                                                            {tenant.grace_period_days} days left
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(tenant.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingTenant(tenant)}
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

                                                        {tenant.status !== 'Canceled' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                onClick={() => setCancelingTenant(tenant)}
                                                                title="Cancel Subscription"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        {tenant.can_restore && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => setRestoringTenant(tenant)}
                                                                title="Restore"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        {tenant.can_delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => setDeletingTenant(tenant)}
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {tenants.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(tenants.current_page - 1) * tenants.per_page + 1} to{' '}
                                    {Math.min(tenants.current_page * tenants.per_page, tenants.total)} of{' '}
                                    {tenants.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tenants.current_page === 1}
                                        onClick={() =>
                                            router.get(`/tenants?page=${tenants.current_page - 1}`, { ...filters }, { preserveState: true })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tenants.current_page === tenants.last_page}
                                        onClick={() =>
                                            router.get(`/tenants?page=${tenants.current_page + 1}`, { ...filters }, { preserveState: true })
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TenantFormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                plans={plans}
            />

            <EditTenantModal
                open={!!editingTenant}
                onOpenChange={(open) => !open && setEditingTenant(null)}
                tenant={editingTenant}
            />

            <CancelTenantDialog
                open={!!cancelingTenant}
                onOpenChange={(open) => !open && setCancelingTenant(null)}
                tenant={cancelingTenant}
            />

            <RestoreTenantDialog
                open={!!restoringTenant}
                onOpenChange={(open) => !open && setRestoringTenant(null)}
                tenant={restoringTenant}
            />

            <DeleteTenantDialog
                open={!!deletingTenant}
                onOpenChange={(open) => !open && setDeletingTenant(null)}
                tenant={deletingTenant}
            />
        </AppLayout>
    );
}

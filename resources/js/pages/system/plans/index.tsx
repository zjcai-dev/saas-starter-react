import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
import { toast } from 'sonner';
import PlanFormModal from './components/plan-form-modal';
import DeletePlanDialog from './components/delete-plan-dialog';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    price_formatted: string;
    currency: string;
    duration_in_days: number;
    duration_text: string;
    is_free: boolean;
    is_active: boolean;
    tenants_count: number;
};

type PlansPageProps = PageProps & {
    plans: {
        data: Plan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        is_active?: string;
        is_free?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plans',
        href: '/plans',
    },
];

export default function PlansIndex() {
    const { plans, filters, stats, flash } = usePage<PlansPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

    // Show flash messages
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
        router.get(
            '/plans',
            { search: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params: Record<string, string> = { search };

        if (value === 'active') {
            params.is_active = '1';
        } else if (value === 'inactive') {
            params.is_active = '0';
        }

        router.get('/plans', params, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plans" />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Plans</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your subscription plans
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Plan
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Plans
                            </p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Active Plans
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                                {stats.active}
                            </p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Inactive Plans
                            </p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                                {stats.inactive}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters and Table */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card md:min-h-min dark:border-sidebar-border">
                    <div className="p-6 space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Tabs value={activeTab} onValueChange={handleTabChange}>
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search plans..."
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
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tenants</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No plans found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        plans.data.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell>
                                                    <div className="font-medium">{plan.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {plan.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {plan.price_formatted}
                                                    </div>
                                                    {plan.is_free && (
                                                        <Badge variant="secondary" className="mt-1">
                                                            Free
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{plan.duration_text}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            plan.is_active ? 'default' : 'secondary'
                                                        }
                                                    >
                                                        {plan.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{plan.tenants_count}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditingPlan(plan)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setDeletingPlan(plan)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {plans.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(plans.current_page - 1) * plans.per_page + 1} to{' '}
                                    {Math.min(plans.current_page * plans.per_page, plans.total)} of{' '}
                                    {plans.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={plans.current_page === 1}
                                        onClick={() =>
                                            router.get(`/plans?page=${plans.current_page - 1}`)
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={plans.current_page === plans.last_page}
                                        onClick={() =>
                                            router.get(`/plans?page=${plans.current_page + 1}`)
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
            <PlanFormModal
                open={isCreateModalOpen || !!editingPlan}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateModalOpen(false);
                        setEditingPlan(null);
                    }
                }}
                plan={editingPlan}
            />
            <DeletePlanDialog
                plan={deletingPlan}
                onOpenChange={() => setDeletingPlan(null)}
            />
        </AppLayout>
    );
}
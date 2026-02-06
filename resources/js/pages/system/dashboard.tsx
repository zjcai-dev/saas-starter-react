import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, UserPlus, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardProps {
    stats: {
        total_tenants: number;
        active_tenants: number;
        trial_tenants: number;
        new_tenants_this_month: number;
    };
    recentTenants: {
        id: string;
        name: string;
        email: string;
        status: string;
        plan_name: string;
        created_at: string;
        domain_url: string | null;
    }[];
    planDistribution: {
        name: string;
        count: number;
    }[];
}

export default function Dashboard({ stats, recentTenants, planDistribution }: DashboardProps) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Trial': return 'secondary';
            case 'Canceled': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_tenants}</div>
                            <p className="text-xs text-muted-foreground">Registered businesses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_tenants}</div>
                            <p className="text-xs text-muted-foreground">Currently paying</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Trial</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.trial_tenants}</div>
                            <p className="text-xs text-muted-foreground">Potential conversions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.new_tenants_this_month}</div>
                            <p className="text-xs text-muted-foreground">Growth rate</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Recent Tenants List */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Tenants</CardTitle>
                            <CardDescription>Latest 5 registered companies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTenants.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No tenants found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentTenants.map((tenant) => (
                                            <TableRow key={tenant.id}>
                                                <TableCell>
                                                    <div className="font-medium">{tenant.name}</div>
                                                    <div className="text-sm text-muted-foreground hidden md:inline">{tenant.email}</div>
                                                </TableCell>
                                                <TableCell>{tenant.plan_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(tenant.status) as any}>
                                                        {tenant.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {tenant.domain_url && (
                                                        <a 
                                                            href={tenant.domain_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            <span className="sr-only">Visit</span>
                                                        </a>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Plan Distribution (Simple List for now) */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Plan Distribution</CardTitle>
                            <CardDescription>
                                Active subscriptions by plan type.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {planDistribution.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No data available.</div>
                                ) : (
                                    planDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center">
                                            <div className="w-full flex items-center justify-between">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-sm text-muted-foreground font-mono">{item.count}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

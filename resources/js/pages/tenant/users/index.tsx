import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import TenantAppLayout from '@/layouts/tenant-app-layout';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Folder, MoreHorizontal, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import UserFormModal from './components/user-form-modal';
import { toast } from 'sonner';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Link {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersProps {
    users: {
        data: User[];
        links: Link[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Index({ users }: UsersProps) {
    const { auth } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(route('tenant.users.destroy', deleteId), {
                onSuccess: () => {
                    toast.success('User deleted successfully');
                    setDeleteId(null);
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to delete user');
                }
            });
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    return (
        <TenantAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header with Action */}
                <div className="flex items-center justify-between">
                    <Heading
                        title="Users"
                        description="Manage users in your workspace."
                    />
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        New User
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {users.total || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Active Today
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {users.data.length || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-500/10 p-3">
                                <Users className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    New This Month
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {users.data.length || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-500/10 p-3">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table Card */}
                <div className="relative flex-1 rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">All Users</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No users found. Create your first user to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                                {user.id === auth.user.id && (
                                                    <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {formatDate(user.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => confirmDelete(user.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                            disabled={user.id === auth.user.id}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex justify-center gap-2 border-t p-4">
                            {users.links.map((link: any, i: number) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                    onClick={() => !link.url && null}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <UserFormModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    user={editingUser}
                />

                <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the
                                user account and remove their data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TenantAppLayout>
    );
}

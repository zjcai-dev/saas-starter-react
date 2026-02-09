import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TenantAppLayout from '@/layouts/tenant-app-layout';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';
import { SharedData } from '@/types';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    // Using manual routes for now or I should rely on the generated routes.
    // The previous steps updated routes/tenant-settings.php to use 'tenant.settings.profile.update'
    // I need to import those routes. But since I am in a "write_to_file" I might not have the route helper updated yet.
    // I will use static strings or route helper if available. 
    // Ideally I should regenerate routes first. But I can't do that easily from here without running a command.
    // I will assume route() helper works if I use the string names.
    // But in the previous files, imports like `import { edit, update } from '@/routes/profile';` were used.
    // These generated files might not exist for tenant settings yet.
    // I will use direct `usePage().props` or similar if possible, or just standard form submission to URL.
    // Actually, Ziggy/Wayfinder generates these files.
    // Since I cannot run the generator right now, I will use the `route(...)` helper if available globally, OR use standard Inertia `useForm` / `router`.
    // The previous examples used imported route helpers.
    // I will try to use `route('tenant.settings.profile.update')` if I can access the global route function,
    // OR just hardcode the URL for now: `/settings/profile`.
    // Wait, the previous `routes/tenant-settings.php` defined:
    // Route::patch('settings/profile', ...)->name('tenant.settings.profile.update');
    // So the URL is `/settings/profile`.
    
    return (
        <TenantAppLayout breadcrumbs={[
            { title: 'Profile settings', href: '/tenant/settings/profile' }
        ]}>
            <Head title="Profile settings" />

            <TenantSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        action="/tenant/settings/profile"
                        method="patch"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href="/email/verification-notification"
                                                    method="post"
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </TenantSettingsLayout>
        </TenantAppLayout>
    );
}

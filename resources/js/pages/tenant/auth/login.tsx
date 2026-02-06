import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TenantAuthLayout from '@/layouts/tenant-auth-layout';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Using static route string to avoid Ziggy/Wayfinder issues for now, or naming mismatch
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <TenantAuthLayout
            title="Log in to your tenant"
            description="Enter your email and password to access your account"
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="block">
                        <div className="flex items-center">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', !!checked)
                                }
                            />
                            <label
                                htmlFor="remember"
                                className="ms-2 text-sm text-muted-foreground"
                            >
                                Remember me
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={processing}>
                        Log in
                    </Button>
                </div>
            </form>
        </TenantAuthLayout>
    );
}

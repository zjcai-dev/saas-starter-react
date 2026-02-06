import { Head, useForm, router } from '@inertiajs/react'; // Valid imports for Inertia React v1/v2
import { FormEventHandler, useRef } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'General Settings',
        href: '/settings/general',
    },
];

interface Props {
    app_name: string;
    app_logo: string | null;
}

export default function GeneralSettings({ app_name, app_logo }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        app_name: app_name,
        app_logo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/general', {
            preserveScroll: true,
            onSuccess: () => {
                // Should force a reload or just let Inertia handle the shared prop update?
                // Shared props update automatically on next visit, but preserving state might keep old props?
                // Let's rely on standard behavior first.
                // Reset file input
                if (fileInput.current) {
                    fileInput.current.value = '';
                }
                setData('app_logo', null);
            },
        });
    };

    const selectNewLogo = () => {
        fileInput.current?.click();
    };

    const updateLogoPreview = () => {
        const photo = fileInput.current?.files?.[0];

        if (!photo) return;

        setData('app_logo', photo);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        title="General Settings"
                        description="Update your application's public identity."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="app_name">Application Name</Label>
                            <Input
                                id="app_name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.app_name}
                                onChange={(e) => setData('app_name', e.target.value)}
                                required
                                autoFocus
                                autoComplete="organization"
                            />
                            <InputError className="mt-2" message={errors.app_name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app_logo">Application Logo</Label>
                            
                            {/* Current Logo Preview */}
                            <div className="mt-2">
                                {(data.app_logo && data.app_logo instanceof File) ? (
                                    <div
                                        className="mb-4 h-20 w-20 rounded-md bg-cover bg-center bg-no-repeat border"
                                        style={{ backgroundImage: `url('${URL.createObjectURL(data.app_logo)}')` }}
                                    />
                                ) : app_logo ? (
                                    <div className="mb-4">
                                         <img src={`/storage/${app_logo}`} alt="Current Logo" className="h-20 w-auto object-contain rounded-md border p-2" />
                                    </div>
                                ) : (
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                        No Logo
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInput}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={updateLogoPreview}
                            />

                            <Button type="button" variant="secondary" onClick={selectNewLogo}>
                                Select A New Logo
                            </Button>

                            <InputError className="mt-2" message={errors.app_logo} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

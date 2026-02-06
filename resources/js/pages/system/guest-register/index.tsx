import React, { useState } from 'react';
import AuthBase from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Head, useForm } from '@inertiajs/react';

// Types
interface FreePlan {
    id: number;
    name: string;
    description?: string;
}

interface IndexProps {
    app_url_base: string;
    free_plan: FreePlan | null;
}

interface FormData {
    company_name: string;
    owner_name: string;
    owner_email: string;
    owner_email: string;
    domain: string;
    password: string;
    password_confirmation: string;
}

const Index: React.FC<IndexProps> = ({ app_url_base, free_plan }) => {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        company_name: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        domain: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/guest-register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // For existing users to access their tenant
    const [loginSubdomain, setLoginSubdomain] = useState('');

    const goToTenantLogin = () => {
        const subdomain = loginSubdomain.trim();
        if (!subdomain) return;

        const tenantUrl = `${window.location.protocol}//${subdomain}.${app_url_base}/login`;
        window.location.href = tenantUrl;
    };

    const handleLoginSubdomainKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            goToTenantLogin();
        }
    };

    return (
        <AuthBase
            title="Crear tu cuenta"
            description="Completa el formulario para registrar tu empresa y acceder a la plataforma."
        >
            <Head title="Registro de invitados" />

            {free_plan && (
                <p className="mb-4 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    Se te asignará el plan <strong>{free_plan.name}</strong> al registrarte.
                </p>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_name">Nombre de la empresa</Label>
                    <Input
                        id="company_name"
                        value={data.company_name}
                        onChange={(e) => setData('company_name', e.target.value)}
                        type="text"
                        required
                        autoFocus
                        placeholder="Mi Empresa S.A.C."
                    />
                    <InputError message={errors.company_name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="owner_name">Nombre del responsable</Label>
                    <Input
                        id="owner_name"
                        value={data.owner_name}
                        onChange={(e) => setData('owner_name', e.target.value)}
                        type="text"
                        required
                        placeholder="Juan Pérez"
                    />
                    <InputError message={errors.owner_name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="owner_email">Correo electrónico</Label>
                    <Input
                        id="owner_email"
                        value={data.owner_email}
                        onChange={(e) => setData('owner_email', e.target.value)}
                        type="email"
                        required
                        placeholder="juan@miempresa.com"
                    />
                    <InputError message={errors.owner_email} />
                </div>



                <div className="grid gap-2">
                    <Label htmlFor="domain">Subdominio</Label>
                    <div className="flex items-center gap-1">
                        <Input
                            id="domain"
                            value={data.domain}
                            onChange={(e) => setData('domain', e.target.value)}
                            type="text"
                            required
                            placeholder="miempresa"
                            className="rounded-r-none"
                        />
                        <span className="rounded-r-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                            .{app_url_base}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Solo letras, números y guiones. Mínimo 3 caracteres.
                    </p>
                    <InputError message={errors.domain} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        required
                        placeholder="Mínimo 8 caracteres"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        required
                        placeholder="Repite la contraseña"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <InputError message={(errors as any).plan} />
                <InputError message={(errors as any).submit} />

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
            </form>

            {/* Login section for existing users */}
            <div className="mt-6 pt-6 border-t border-muted">
                <p className="text-center text-sm text-muted-foreground mb-3">
                    ¿Ya tienes cuenta? Ingresa tu subdominio para iniciar sesión:
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <input
                            value={loginSubdomain}
                            onChange={(e) => setLoginSubdomain(e.target.value)}
                            type="text"
                            placeholder="tu-empresa"
                            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            onKeyUp={handleLoginSubdomainKeyPress}
                        />
                        <span className="text-muted-foreground">.{app_url_base}</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={goToTenantLogin}
                        disabled={!loginSubdomain.trim()}
                    >
                        Ir
                    </Button>
                </div>
            </div>
        </AuthBase>
    );
};

export default Index;
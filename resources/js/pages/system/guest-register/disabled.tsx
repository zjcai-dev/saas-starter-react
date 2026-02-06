import React from 'react';
import AuthBase from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

const Disabled: React.FC = () => {
    return (
        <AuthBase
            title="Registro deshabilitado"
            description="El registro de invitados está actualmente deshabilitado."
        >
            <Head title="Registro deshabilitado" />

            <div className="flex flex-col gap-4 rounded-lg border border-muted bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    No es posible crear una cuenta en este momento. Si necesitas acceso, contacta al
                    administrador del sistema.
                </p>
                {/* Uncomment if needed
                <Button asChild variant="default" className="w-full">
                    <Link href={route('login')}>Ir a iniciar sesión</Link>
                </Button>
                */}
            </div>
        </AuthBase>
    );
};

export default Disabled;
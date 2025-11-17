import { ComponentType, useEffect } from 'react';
import AuthGuard from '@/guards/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Role } from '@/interfaces/enums';

interface WithAuthOptions {
    allowedRoles?: string[];
}

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>, options: WithAuthOptions = {}) =>
{
    const ComponentWithAuth = (props: P) => {
        const { isAuthenticated, user, isLoading } = useAuth();
        const router = useRouter();
        const { allowedRoles } = options;

        useEffect(() =>
        {
            if (!isLoading)
            {
                if (!isAuthenticated)
                {
                    router.push('/signin');
                    return;
                }

                if (allowedRoles && user)
                {
                    const hasPermission = allowedRoles.includes(user.role as Role);

                    if (!hasPermission)
                    {
                        router.push('/unauthorized');
                        return;
                    }
                }
            }
        }, [isAuthenticated, isLoading, user, router]);

        if (isLoading)
        {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    Cargando...
                </div>
            );
        }

        if (!isAuthenticated) return null;

        if (allowedRoles && user)
        {
            const hasPermission = allowedRoles.includes(user.role as Role);
            if (!hasPermission) return null;
        }

        return <WrappedComponent {...props} />;
    };

    ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

    return ComponentWithAuth;
};

export default withAuth;
import { ComponentType } from 'react';
import AuthGuard from '@/guards/AuthGuard';

interface WithAuthOptions {
    allowedRoles?: string[];
}

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>, options: WithAuthOptions = {}) =>
{
    const AuthenticatedComponent = (props: P) =>
    {
        return (
            <AuthGuard allowedRoles={options.allowedRoles} >
                <WrappedComponent {...props} />
            </AuthGuard>
        )
    }

    AuthenticatedComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

    return AuthenticatedComponent;
}

export default withAuth;
import { useState, useMemo } from 'react';
import { RequestStatus, Role } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';

interface UseRequestStatusProps {
    currentStatus: RequestStatus;
    onStatusChange: (newStatus: RequestStatus) => Promise<void>;
}

interface StatusAction {
    status: RequestStatus;
    label: string;
    variant: 'approve' | 'reject' | 'cancel' | 'progress' | 'complete';
    icon: string;
}

export const useRequestStatus = ({ currentStatus, onStatusChange }: UseRequestStatusProps) =>
{
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const getAvailableActions = useMemo((): StatusAction[] =>
    {
        const userRole = user?.role as Role;

        if (!userRole) return [];

        const canApprove = [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER].includes(userRole);
        const canCancel = [Role.ADMIN, Role.MANAGER].includes(userRole);
        const canProgress = [Role.ADMIN, Role.MANAGER, Role.COURIER].includes(userRole);

        switch (currentStatus)
        {
            case RequestStatus.PENDING:
                const pendingActions: StatusAction[] = [];

                if (canApprove)
                {
                    pendingActions.push({
                        status: RequestStatus.APPROVED,
                        label: 'Aprobar',
                        variant: 'approve',
                        icon: '✓',
                    });

                    pendingActions.push({
                        status: RequestStatus.REJECTED,
                        label: 'Rechazar',
                        variant: 'reject',
                        icon: '✗',
                    });
                }

                if (canCancel)
                {
                    pendingActions.push({
                        status: RequestStatus.CANCELED,
                        label: 'Cancelar',
                        variant: 'cancel',
                        icon: '⊘',
                    });
                }

                return pendingActions;

            case RequestStatus.APPROVED:
                if (canProgress)
                {
                    return [{
                        status: RequestStatus.IN_PROGRESS,
                        label: 'Iniciar Despacho',
                        variant: 'progress',
                        icon: '🚚',
                    }];
                }
                return [];

            case RequestStatus.IN_PROGRESS:
                if (canProgress)
                {
                    return [{
                        status: RequestStatus.COMPLETED,
                        label: 'Completar Entrega',
                        variant: 'complete',
                        icon: '✓',
                    }];
                }
                return [];

            case RequestStatus.REJECTED:
            case RequestStatus.CANCELED:
            case RequestStatus.COMPLETED:
                return [];

            default:
                return [];
        }
    }, [currentStatus, user?.role]);

    const executeStatusChange = async (newStatus: RequestStatus) =>
    {
        setIsProcessing(true);
        try
        {
            await onStatusChange(newStatus);
        }
        catch (error)
        {
            console.error('Error al cambiar estado:', error);
            throw error;
        }
        finally
        {
            setIsProcessing(false);
        }
    };

    const canModifyStatus = useMemo(() =>
    {
        return getAvailableActions.length > 0;
    }, [getAvailableActions]);

    const getStatusColor = (status: RequestStatus): string =>
    {
        const colors: Record<RequestStatus, string> = {
            [RequestStatus.PENDING]: '#ff9800',
            [RequestStatus.APPROVED]: '#4caf50',
            [RequestStatus.REJECTED]: '#f44336',
            [RequestStatus.IN_PROGRESS]: '#2196f3',
            [RequestStatus.COMPLETED]: '#4caf50',
            [RequestStatus.CANCELED]: '#f44336'
        };
        return colors[status] || '#666';
    };

    const getStatusLabel = (status: RequestStatus): string =>
    {
        const labels: Record<RequestStatus, string> = {
            [RequestStatus.PENDING]: 'Pendiente',
            [RequestStatus.APPROVED]: 'Aprobada',
            [RequestStatus.REJECTED]: 'Rechazada',
            [RequestStatus.IN_PROGRESS]: 'En Proceso',
            [RequestStatus.COMPLETED]: 'Completada',
            [RequestStatus.CANCELED]: 'Cancelada'
        };
        return labels[status] || status;
    };

    const isFinalStatus = (status: RequestStatus): boolean =>
    {
        return [RequestStatus.COMPLETED, RequestStatus.REJECTED, RequestStatus.CANCELED].includes(status);
    };

    return {
        availableActions: getAvailableActions,
        canModifyStatus,
        isProcessing,
        executeStatusChange,
        getStatusColor,
        getStatusLabel,
        isFinalStatus: isFinalStatus(currentStatus),
        currentStatusLabel: getStatusLabel(currentStatus),
        currentStatusColor: getStatusColor(currentStatus)
    };
};
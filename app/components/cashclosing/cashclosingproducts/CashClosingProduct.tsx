'use client';

import styles from './cashclosingproducts.module.css';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CashClosing } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { formatTimeLocal } from '@/lib/dateUtils';

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    IN_PROGRESS: 'En progreso',
};

const statusClass: Record<string, string> = {
    PENDING: styles.statusPending,
    COMPLETED: styles.statusCompleted,
    CANCELLED: styles.statusCancelled,
    IN_PROGRESS: styles.statusInProgress,
};

const CashClosingOrders = () =>
{
    const pathname = usePathname();
    const router = useRouter();
    const cashClosingId = pathname.split('/').pop();
    const [cashClosing, setCashClosing] = useState<CashClosing>();
    const { data, error } = useFetch<CashClosing>(`/api/cash-closing/${cashClosingId}`);

    useEffect(() =>
    {
        if (data) setCashClosing(data);
    }, [data]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(numPrice);
    };

    const formatTime = (date: Date | string) => formatTimeLocal(date);

    if (error) return <div className={styles.error}>Error al cargar las órdenes</div>;
    if (!cashClosing) return <div className={styles.loading}>Cargando órdenes...</div>;

    const orders = cashClosing.orders ?? [];

    return (
        <div className={styles.orders}>
            <div className={styles.header}>
                <h2>Órdenes del Cierre</h2>
                <p>{orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}</p>
            </div>

            {orders.length === 0 ? (
                <div className={styles.empty}>No hay órdenes asociadas a este cierre</div>
            ) : (
                <div className={styles.cardList}>
                    {orders.map((rel) =>
                    {
                        const order = rel.order;
                        if (!order) return null;
                        const itemCount = order.details?.length ?? 0;

                        return (
                            <div
                                key={rel.id}
                                className={styles.card}
                                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                            >
                                <div className={styles.cardLeft}>
                                    <span className={styles.orderNum}>#{order.numId}</span>
                                    <span className={styles.orderTime}>{formatTime(order.createdAt)}</span>
                                </div>
                                <div className={styles.cardMiddle}>
                                    <span className={`${styles.statusBadge} ${statusClass[order.status] ?? ''}`}>
                                        {statusLabels[order.status] ?? order.status}
                                    </span>
                                    <span className={styles.items}>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                                </div>
                                <div className={styles.cardRight}>
                                    <span className={styles.total}>{formatPrice(order.totalPrice)}</span>
                                    <span className={styles.payment}>{order.paymentMethod}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CashClosingOrders;

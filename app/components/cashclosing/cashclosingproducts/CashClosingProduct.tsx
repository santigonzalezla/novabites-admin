'use client';

import styles from './cashclosingproducts.module.css';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashClosing } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';

const CashClosingProducts = () =>
{
    const pathname = usePathname();
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
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    };

    if (error)
    {
        return <div className={styles.error}>Error al cargar los productos</div>;
    }

    if (!cashClosing)
    {
        return <div className={styles.loading}>Cargando productos...</div>;
    }

    return (
        <div className={styles.products}>
            <div className={styles.header}>
                <h2>Órdenes del Cierre</h2>
                <p>Total de órdenes: {cashClosing.orders?.length || 0}</p>
            </div>

            {!cashClosing.orders || cashClosing.orders.length === 0 ? (
                <div className={styles.empty}>
                    No hay órdenes asociadas a este cierre
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {cashClosing.orders.map((orderRelation) => (
                        <div key={orderRelation.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <span className={styles.orderNumber}>
                                    Orden #{orderRelation.order?.numId}
                                </span>
                                <span className={styles.orderStatus}>
                                    {orderRelation.order?.status}
                                </span>
                            </div>
                            <div className={styles.orderBody}>
                                <div className={styles.orderDetail}>
                                    <span className={styles.label}>Total:</span>
                                    <span className={styles.value}>
                                        {formatPrice(orderRelation.order?.totalPrice || 0)}
                                    </span>
                                </div>
                                <div className={styles.orderDetail}>
                                    <span className={styles.label}>Método de Pago:</span>
                                    <span className={styles.value}>
                                        {orderRelation.order?.paymentMethod || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CashClosingProducts;
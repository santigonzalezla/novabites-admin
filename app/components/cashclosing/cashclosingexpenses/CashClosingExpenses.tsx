'use client';

import styles from './cashclosingexpenses.module.css';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashClosing } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';

const CashClosingExpenses = () =>
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

    const categoryLabels: Record<string, string> = {
        'RENT': 'Arriendo',
        'UTILITIES': 'Servicios Públicos',
        'SERVICES': 'Servicios',
        'MAINTENANCE': 'Mantenimiento',
        'SUPPLIES': 'Suministros',
        'OTHER': 'Otro'
    };

    if (error) {
        return <div className={styles.error}>Error al cargar los gastos</div>;
    }

    if (!cashClosing)
    {
        return <div className={styles.loading}>Cargando gastos...</div>;
    }

    const totalExpenses = cashClosing.expenses?.reduce((sum, expenseRelation) =>
    {
        const amount = typeof expenseRelation.expense?.amount === 'string'
            ? parseFloat(expenseRelation.expense.amount)
            : expenseRelation.expense?.amount || 0;
        return sum + amount;
    }, 0) || 0;

    return (
        <div className={styles.expenses}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Gastos del Cierre</h2>
                    <p>Total de gastos: {cashClosing.expenses?.length || 0}</p>
                </div>
                <div className={styles.totalSection}>
                    <span className={styles.totalLabel}>Total de Gastos:</span>
                    <span className={styles.totalValue}>{formatPrice(totalExpenses)}</span>
                </div>
            </div>


            {!cashClosing.expenses || cashClosing.expenses.length === 0 ? (
                <div className={styles.empty}>
                    No hay gastos asociados a este cierre
                </div>
            ) : (
                <>
                    <div className={styles.expensesList}>
                        {cashClosing.expenses.map((expenseRelation) => (
                            <div key={expenseRelation.id} className={styles.expenseCard}>
                                <div className={styles.expenseHeader}>
                                    <span className={styles.categoryBadge}>
                                        {categoryLabels[expenseRelation.expense?.category || 'OTHER']}
                                    </span>
                                    <span className={styles.expenseAmount}>
                                        {formatPrice(expenseRelation.expense?.amount || 0)}
                                    </span>
                                </div>
                                <div className={styles.expenseBody}>
                                    <p className={styles.expenseDescription}>
                                        {expenseRelation.expense?.description || 'Sin descripción'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CashClosingExpenses;
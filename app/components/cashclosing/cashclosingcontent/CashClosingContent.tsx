'use client';

import styles from './cashclosingcontent.module.css';
import { ExternalLink } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashClosing } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { formatDateOnly, formatDateShort, formatTimeLocal } from '@/lib/dateUtils';
import Link from 'next/link';

interface RequestContentProps {
    setId: (id: string) => void;
}

const CashClosingContent = ({ setId }: RequestContentProps) =>
{
    const pathname = usePathname();
    const cashClosingId = pathname.split('/').pop();
    const [cashClosing, setCashClosing] = useState<CashClosing>();
    const { data, error } = useFetch<CashClosing>(`/api/cash-closing/${cashClosingId}`);

    useEffect(() =>
    {
        if (data)
        {
            setId(String(data.numId));
            setCashClosing(data);
        }
    }, [data]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    };

    if (error)
    {
        return (
            <div className={styles.error}>
                Error al cargar los datos del cierre de caja
            </div>
        );
    }

    if (!cashClosing)
    {
        return (
            <div className={styles.loading}>
                Cargando datos del cierre de caja...
            </div>
        );
    }

    const netProfitValue = typeof cashClosing.netProfit === 'string'
        ? parseFloat(cashClosing.netProfit)
        : cashClosing.netProfit;

    return (
        <div className={styles.productcontent}>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    {/* Información General */}
                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Información General</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Fecha de Cierre:</span>
                                    <input
                                        type="text"
                                        value={formatDateOnly(cashClosing.closingDate)}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Hora de Creación:</span>
                                    <input
                                        type="text"
                                        value={formatTimeLocal(cashClosing.createdAt)}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Total Órdenes:</span>
                                    <input
                                        type="text"
                                        value={cashClosing.totalOrders}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Datos de Cierre</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Nombre de Usuario:</span>
                                    <input
                                        type="text"
                                        value={cashClosing.user?.name || 'N/A'}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Tienda Origen:</span>
                                    <input
                                        type="text"
                                        value={cashClosing.store?.name || 'N/A'}
                                        disabled
                                        className={styles.disabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Descripción del Cierre</h2>
                            <div className={styles.descriptionBox}>
                                <textarea
                                    value={cashClosing.description}
                                    disabled
                                    className={styles.disabled}
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Lateral */}
                <div className={styles.sideContent}>
                    <Link href={`/dashboard/requests/${cashClosing.storeRequest?.id}`} className={styles.watchLink}>
                        <ExternalLink /> Ver solicitud
                    </Link>
                    {/* Información Adicional */}
                    <div className={styles.financialSummary}>
                        <div className={styles.financialTop}>
                            <h3 className={styles.summaryTitle}>Solicitud Asociada</h3>
                        </div>
                        <div className={styles.stockSummary}>
                            <div className={styles.stockItem}>
                                <div className={styles.stockLabel}>ID Solicitud:</div>
                                <div className={styles.stockNumber}>
                                    {cashClosing.storeRequest ? `#${cashClosing.storeRequest.numId}` : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className={styles.stockSummary}>
                            <div className={styles.stockItem}>
                                <div className={styles.stockLabel}>Fecha de Creación</div>
                                <div className={styles.stockNumber}>{formatDateShort(cashClosing.createdAt)}</div>
                            </div>
                        </div>

                        <div className={styles.stockSummary}>
                            <div className={styles.stockItem}>
                                <div className={styles.stockLabel}>Última Actualización</div>
                                <div className={styles.stockNumber}>{formatDateShort(cashClosing.updatedAt)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Financiero */}
                    <div className={styles.financialSummary}>
                        <h3 className={styles.summaryTitle}>Resumen Financiero</h3>

                        <div className={styles.financialItem}>
                            <div className={styles.stockLabel}>Ingresos Totales</div>
                            <div className={styles.financialValue}>
                                {formatPrice(cashClosing.totalRevenue)}
                            </div>
                        </div>

                        <div className={styles.financialItem}>
                            <div className={styles.stockLabel}>Gastos Totales</div>
                            <div className={styles.financialValue}>
                                {formatPrice(cashClosing.totalExpenses)}
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.financialItem} ${styles.netProfit}`}>
                            <div className={styles.stockLabel}>Ganancia Neta</div>
                            <div className={`${styles.financialValue} ${
                                netProfitValue >= 0 ? styles.positive : styles.negative
                            }`}>
                                {formatPrice(cashClosing.netProfit)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CashClosingContent;
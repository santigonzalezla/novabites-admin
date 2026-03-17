'use client';

import { useEffect, useState } from 'react';
import { CustomOrder } from '@/interfaces/interfaces';
import styles from './customorderstable.module.css';
import OrderDetailsModal from '../orderdetailsmodal/OrderDetailsModal';
import { ArrowDown, Filter, Reset } from '@/app/components/svg';

interface CustomOrdersTableProps {
    orders?: CustomOrder[];
    onVisibleCountChange?: (count: number) => void;
}

const getDateInputValue = (date: Date) =>
{
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getSafeDateInputValue = (dateValue?: string | Date) =>
{
    if (!dateValue) return '';

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return '';

    return getDateInputValue(parsedDate);
};

const CustomOrdersTable = ({ orders = [], onVisibleCountChange }: CustomOrdersTableProps) => {
    const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
    const [filterClient, setFilterClient] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStore, setFilterStore] = useState('');
    const [filterDate, setFilterDate] = useState(getDateInputValue(new Date()));
    const normalizeStatus = (status: string) => String(status).toLowerCase();

    // Filtrar pedidos
    const filteredOrders = orders.filter(order => {
        const matchClient = !filterClient || (order.client?.name && order.client.name.toLowerCase().includes(filterClient.toLowerCase()));
        const normalizedStatus = normalizeStatus(order.status);
        const matchStatus = !filterStatus || normalizedStatus === filterStatus;
        const matchStore = !filterStore || order.store?.name.toLowerCase().includes(filterStore.toLowerCase());
        const deliveryDate = getSafeDateInputValue((order as CustomOrder & { deliveryDate?: string | Date }).deliveryDate);
        const matchDate = !filterDate || deliveryDate === filterDate;

        return matchClient && matchStatus && matchStore && matchDate;
    });

    useEffect(() =>
    {
        onVisibleCountChange?.(filteredOrders.length);
    }, [filteredOrders.length, onVisibleCountChange]);

    // Obtener opciones únicas para filtros
    const uniqueStores = Array.from(new Set(orders.map(o => o.store?.name).filter(Boolean)));
    const statuses = [
        { value: 'pending', label: 'Pendiente' },
        { value: 'in_progress', label: 'En Progreso' },
        { value: 'completed', label: 'Completado' },
        { value: 'cancelled', label: 'Cancelado' }
    ];

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'Pendiente',
            in_progress: 'En Progreso',
            completed: 'Completado',
            cancelled: 'Cancelado',
            canceled: 'Cancelado'
        };
        const normalizedStatus = normalizeStatus(status);
        return statusMap[normalizedStatus] || status;
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (value: number | string) => `$${Number(value).toLocaleString('es-CO')}`;

    const handleResetFilters = () => {
        setFilterClient('');
        setFilterStatus('');
        setFilterStore('');
        setFilterDate(getDateInputValue(new Date()));
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterBar}>
                            <div className={styles.filterIcon}>
                                <Filter />
                            </div>
                            <div className={styles.filterLabel}>
                                <span>Filtrar por</span>
                            </div>

                            <div className={styles.filterContent}>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={filterClient}
                                    onChange={(e) => setFilterClient(e.target.value)}
                                    className={styles.filterInput}
                                />
                                <ArrowDown />
                            </div>

                            <div className={styles.filterContent}>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className={`${styles.filterInput} ${styles.dateInput}`}
                                />
                                <ArrowDown />
                            </div>

                            <div className={styles.filterContent}>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Estado</option>
                                    {statuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                <ArrowDown />
                            </div>

                            <div className={styles.filterContent}>
                                <select
                                    value={filterStore}
                                    onChange={(e) => setFilterStore(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Tienda</option>
                                    {uniqueStores.map(store => (
                                        <option key={store} value={store}>
                                            {store}
                                        </option>
                                    ))}
                                </select>
                                <ArrowDown />
                            </div>

                            <button
                                type="button"
                                className={styles.filterReset}
                                onClick={handleResetFilters}
                            >
                                <Reset />
                                Limpiar Filtro
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#Pedido</th>
                                <th>Entrega</th>
                                <th>Cliente</th>
                                <th>Detalles</th>
                                <th>Depósito</th>
                                <th>Restante</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Tienda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className={styles.clickableRow}
                                >
                                    <td className={styles.orderNumber}>#{order.numId}</td>
                                    <td className={styles.time}>{(order as CustomOrder & { deliveryDate?: string | Date }).deliveryDate ? formatDate((order as CustomOrder & { deliveryDate?: string | Date }).deliveryDate as string | Date) : '-'}</td>
                                    <td>{order.client ? order.client.name : 'N/A'}</td>
                                    <td>
                                        <div className={styles.details}>
                                            {order.details ? order.details.map((detail, idx) => (
                                                <span key={idx} className={styles.badge}>
                                                    {detail.pounds}lb / {detail.tiers}n
                                                </span>
                                            )) : null}
                                        </div>
                                    </td>
                                    <td className={styles.price}>{formatCurrency(order.depositAmount)}</td>
                                    <td className={styles.price}>{formatCurrency(order.remainingAmount)}</td>
                                    <td className={styles.totalPrice}>{formatCurrency(order.totalPrice)}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[normalizeStatus(order.status)] || ''}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td>{order.store?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className={styles.noData}>
                            No hay pedidos para mostrar
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </>
    );
};

export default CustomOrdersTable;
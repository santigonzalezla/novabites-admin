'use client';

import { useState } from 'react';
import { CustomOrder } from '@/interfaces/interfaces';
import styles from './customorderstable.module.css';
import OrderDetailsModal from '../orderdetailsmodal/OrderDetailsModal';
import { formatTimeLocal } from '@/lib/dateUtils';

interface CustomOrdersTableProps {
    orders?: CustomOrder[];
}

const CustomOrdersTable = ({ orders = [] }: CustomOrdersTableProps) => {
    const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
    const [filterClient, setFilterClient] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStore, setFilterStore] = useState('');

    // Filtrar pedidos
    const filteredOrders = orders.filter(order => {
        const matchClient = !filterClient || (order.client?.name && order.client.name.toLowerCase().includes(filterClient.toLowerCase()));
        const matchStatus = !filterStatus || order.status === filterStatus;
        const matchStore = !filterStore || order.store?.name.toLowerCase().includes(filterStore.toLowerCase());
        return matchClient && matchStatus && matchStore;
    });

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
            cancelled: 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const formatTime = (date: string) => formatTimeLocal(date);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={filterClient}
                        onChange={(e) => setFilterClient(e.target.value)}
                        className={styles.filterInput}
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos los estados</option>
                        {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterStore}
                        onChange={(e) => setFilterStore(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todas las tiendas</option>
                        {uniqueStores.map(store => (
                            <option key={store} value={store}>
                                {store}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#Pedido</th>
                                <th>Hora</th>
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
                                    <td className={styles.time}>{formatTime(order.createdAt.toString())}</td>
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
                                    <td className={styles.price}>${Number(order.depositAmount).toFixed(2)}</td>
                                    <td className={styles.price}>${Number(order.remainingAmount).toFixed(2)}</td>
                                    <td className={styles.totalPrice}>${Number(order.totalPrice).toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[order.status]}`}>
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
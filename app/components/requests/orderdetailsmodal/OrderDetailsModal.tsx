'use client';

import styles from './orderdetailsmodal.module.css';
import { CustomOrder } from '@/interfaces/interfaces';
import { enumValueToLabel } from '@/lib/enumUtils';
import { formatDateShort, formatTimeLocal } from '@/lib/dateUtils';
import Image from 'next/image';

interface OrderDetailsModalProps {
    order: CustomOrder;
    onClose: () => void;
}

const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) =>
{
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget)
        {
            onClose();
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Detalles del Pedido #{order.numId}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* Información General */}
                    <section className={styles.section}>
                        <h3>Información General</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Estado:</span>
                                <span className={styles.value}>
                                    {enumValueToLabel(order.status)}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Fecha:</span>
                                <span className={styles.value}>
                                    {formatTimeLocal(order.createdAt)}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Hora:</span>
                                <span className={styles.value}>
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Tienda:</span>
                                <span className={styles.value}>
                                    {order.store?.name || '-'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Información del Cliente */}
                    <section className={styles.section}>
                        <h3>Cliente</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Nombre:</span>
                                <span className={styles.value}>
                                    {order.client?.name || '-'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Teléfono:</span>
                                <span className={styles.value}>
                                    {order.client?.phone || '-'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>
                                    {order.client?.email || '-'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Detalles del Pastel */}
                    {order.details && order.details.length > 0 && (
                        <section className={styles.section}>
                            <h3>Detalles del Pastel</h3>
                            <div className={styles.cakeDetails}>
                                {order.details.map((detail, idx) => (
                                    <div key={idx} className={styles.cakeCard}>
                                        {detail.imageUrl && (
                                            <div className={styles.imageWrapper}>
                                                <Image
                                                    src={detail.imageUrl}
                                                    alt={`Diseño ${idx + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className={styles.cakeImage}
                                                />
                                            </div>
                                        )}
                                        <div className={styles.cakeInfo}>
                                            <p><strong>Libras:</strong> {detail.pounds} lb</p>
                                            <p><strong>Niveles:</strong> {detail.tiers}</p>
                                            <p><strong>Precio:</strong> ${parseFloat(detail.price as string).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Productos Adicionales */}
                    {order.products && order.products.length > 0 && (
                        <section className={styles.section}>
                            <h3>Productos Adicionales</h3>
                            <div className={styles.productsTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products.map((product, idx) => (
                                            <tr key={idx}>
                                                <td>{product.product?.name || '-'}</td>
                                                <td>{product.quantity}</td>
                                                <td>${parseFloat(product.unitPrice).toFixed(2)}</td>
                                                <td>${parseFloat(product.totalPrice as string).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Resumen de Pagos */}
                    <section className={styles.section}>
                        <h3>Resumen de Pagos</h3>
                        <div className={styles.paymentSummary}>
                            <div className={styles.paymentRow}>
                                <span className={styles.label}>Depósito:</span>
                                <span className={styles.amount}>
                                    ${parseFloat(order.depositAmount as string).toFixed(2)}
                                </span>
                            </div>
                            <div className={styles.paymentRow}>
                                <span className={styles.label}>Restante:</span>
                                <span className={styles.amount}>
                                    ${parseFloat(order.remainingAmount as string).toFixed(2)}
                                </span>
                            </div>
                            <div className={`${styles.paymentRow} ${styles.total}`}>
                                <span className={styles.label}>Total:</span>
                                <span className={styles.amount}>
                                    ${parseFloat(order.totalPrice as string).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;

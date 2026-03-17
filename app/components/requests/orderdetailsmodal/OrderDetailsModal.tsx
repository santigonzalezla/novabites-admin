'use client';

import { useState } from 'react';
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
    const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string; description?: string | null } | null>(null);
    const detailImages = order.details?.filter((detail) => Boolean(detail.imageUrl)) || [];
    const deliveryDate = (order as CustomOrder & { deliveryDate?: string | Date }).deliveryDate;
    const formatCurrency = (value: number | string) => `$${Number(value).toLocaleString('es-CO')}`;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) =>
    {
        if (e.target === e.currentTarget)
        {
            onClose();
        }
    };

    const openExpandedImage = (src: string, alt: string, description?: string | null) =>
    {
        setExpandedImage({ src, alt, description });
    };

    const closeExpandedImage = () =>
    {
        setExpandedImage(null);
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
                                <span className={styles.label}>Fecha de creacion:</span>
                                <span className={styles.value}>
                                    {formatDateShort(order.createdAt)}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Fecha de entrega:</span>
                                <span className={styles.value}>
                                    {deliveryDate ? formatDateShort(deliveryDate) : '-'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Hora:</span>
                                <span className={styles.value}>
                                    {formatTimeLocal(order.createdAt)}
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

                    {detailImages.length > 0 && (
                        <section className={styles.section}>
                            <h3>Fotos del Pedido</h3>
                            <div className={styles.imageGallery}>
                                {detailImages.map((detail, idx) => (
                                    <div key={`${detail.id}-${idx}`} className={styles.galleryItem}>
                                        <button
                                            type="button"
                                            className={styles.imageButton}
                                            onClick={() => openExpandedImage(detail.imageUrl, `Foto del pedido ${idx + 1}`, detail.description)}
                                        >
                                            <div className={styles.galleryImageWrapper}>
                                                <Image
                                                    src={detail.imageUrl}
                                                    alt={`Foto del pedido ${idx + 1}`}
                                                    fill
                                                    className={styles.galleryImage}
                                                />
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Detalles del Pastel */}
                    {order.details && order.details.length > 0 && (
                        <section className={styles.section}>
                            <h3>Detalles del Pastel</h3>
                            <div className={styles.cakeDetails}>
                                {order.details.map((detail, idx) => (
                                    <div key={idx} className={styles.cakeCard}>
                                        {detail.imageUrl && (
                                            <button
                                                type="button"
                                                className={styles.imageButton}
                                                onClick={() => openExpandedImage(detail.imageUrl, `Diseño ${idx + 1}`, detail.description)}
                                            >
                                                <div className={styles.imageWrapper}>
                                                    <Image
                                                        src={detail.imageUrl}
                                                        alt={`Diseño ${idx + 1}`}
                                                        width={200}
                                                        height={200}
                                                        className={styles.cakeImage}
                                                    />
                                                </div>
                                            </button>
                                        )}
                                        <div className={styles.cakeInfo}>
                                            <p><strong>Libras:</strong> {detail.pounds} lb</p>
                                            <p><strong>Niveles:</strong> {detail.tiers}</p>
                                            <p><strong>Precio:</strong> {formatCurrency(detail.price)}</p>
                                            {detail.description && (
                                                <div className={styles.detailDescription}>
                                                    <span className={styles.detailDescriptionTitle}>Descripcion</span>
                                                    <p className={styles.detailDescriptionText}>{detail.description}</p>
                                                </div>
                                            )}
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
                                                <td>{formatCurrency(product.unitPrice)}</td>
                                                <td>{formatCurrency(product.totalPrice)}</td>
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
                                    {formatCurrency(order.depositAmount)}
                                </span>
                            </div>
                            <div className={styles.paymentRow}>
                                <span className={styles.label}>Restante:</span>
                                <span className={styles.amount}>
                                    {formatCurrency(order.remainingAmount)}
                                </span>
                            </div>
                            <div className={`${styles.paymentRow} ${styles.total}`}>
                                <span className={styles.label}>Total:</span>
                                <span className={styles.amount}>
                                    {formatCurrency(order.totalPrice)}
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

            {expandedImage && (
                <div className={styles.lightboxBackdrop} onClick={closeExpandedImage}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className={styles.lightboxClose}
                            onClick={closeExpandedImage}
                        >
                            ✕
                        </button>
                        <div className={styles.lightboxImageWrapper}>
                            <Image
                                src={expandedImage.src}
                                alt={expandedImage.alt}
                                fill
                                sizes="100vw"
                                className={styles.lightboxImage}
                            />
                        </div>
                        {expandedImage.description && (
                            <p className={styles.lightboxDescription}>{expandedImage.description}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsModal;

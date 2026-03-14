'use client';

import styles from './customorderdescription.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CustomOrder, DetailCustomOrder, CustomOrderProduct } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import Modal from '@/app/components/shared/modal/Modal';
import { toast } from 'sonner';

const CustomOrderDescription = () =>
{
    const pathname = usePathname();
    const orderId = pathname.split('/').pop();
    const [formData, setFormData] = useState<CustomOrder>();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { error, execute } = useFetch<CustomOrder>(`/api/custom-order/${orderId}`);

    useEffect(() =>
    {
        if (error)
        {
            toast.error(`Error al cargar los datos: ${error}`, {
                description: 'Por favor, inténtalo de nuevo más tarde.',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const fetchData = async () =>
        {
            const order = await execute();
            if (order) setFormData(order);
        };

        fetchData();
    }, []);

    const details: DetailCustomOrder[] = formData?.details ?? [];
    const products: CustomOrderProduct[] = formData?.products ?? [];

    return (
        <div className={styles.description}>

            {/* Órdenes Internas (DetailCustomOrder) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Órdenes Internas</h2>

                {details.length === 0 ? (
                    <p className={styles.empty}>Sin órdenes internas registradas.</p>
                ) : (
                    <div className={styles.cardGrid}>
                        {details.map((detail, index) => (
                            <div key={detail.id ?? index} className={styles.card}>
                                <div
                                    className={styles.imageWrapper}
                                    onClick={() => setSelectedImage(detail.imageUrl || '/placeholder.jpg')}
                                    title="Ver imagen"
                                >
                                    <Image
                                        src={detail.imageUrl || '/placeholder.jpg'}
                                        alt={`Orden interna ${index + 1}`}
                                        width={120}
                                        height={120}
                                        className={styles.thumbnail}
                                    />
                                    <div className={styles.imageOverlay}>
                                        <span>Ver imagen</span>
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Orden #</span>
                                        <span className={styles.value}>{index + 1}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Libras</span>
                                        <span className={styles.value}>{detail.pounds}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Pisos</span>
                                        <span className={styles.value}>{detail.tiers}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Precio</span>
                                        <span className={styles.value}>
                                            {detail.price != null
                                                ? `$${Number(detail.price).toLocaleString('es-CO')}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Productos (CustomOrderProduct) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Productos</h2>

                {products.length === 0 ? (
                    <p className={styles.empty}>Sin productos registrados.</p>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Producto</span>
                            <span>Cantidad</span>
                            <span>Precio Unit.</span>
                            <span>Total</span>
                        </div>
                        {products.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className={styles.tableRow}>
                                <span>{item.product?.name ?? item.productId}</span>
                                <span>{item.quantity}</span>
                                <span>
                                    {item.unitPrice != null
                                        ? `$${Number(item.unitPrice).toLocaleString('es-CO')}`
                                        : 'N/A'}
                                </span>
                                <span>
                                    {item.totalPrice != null
                                        ? `$${Number(item.totalPrice).toLocaleString('es-CO')}`
                                        : 'N/A'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal de imagen */}
            {selectedImage && (
                <Modal onClose={() => setSelectedImage(null)}>
                    <div className={styles.modalImageWrapper}>
                        <Image
                            src={selectedImage}
                            alt="Imagen de orden interna"
                            width={500}
                            height={500}
                            className={styles.modalImage}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CustomOrderDescription;

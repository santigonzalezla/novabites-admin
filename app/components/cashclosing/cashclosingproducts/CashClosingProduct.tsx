'use client';

import styles from './cashclosingproducts.module.css';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashClosing, CategoryProduct, DetailOrder } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';

interface FlatProduct {
    orderNumId: number;
    productName: string;
    categoryName: string;
    quantity: number;
    price: number | string;
}

const CashClosingProducts = () =>
{
    const pathname = usePathname();
    const cashClosingId = pathname.split('/').pop();
    const [cashClosing, setCashClosing] = useState<CashClosing>();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const { data, error } = useFetch<CashClosing>(`/api/cash-closing/${cashClosingId}`);
    const { data: categoryData } = useFetch<CategoryProduct[]>(`/api/category-product`);

    useEffect(() =>
    {
        if (data) setCashClosing(data);
    }, [data]);

    const formatPrice = (price: number | string) =>
    {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(numPrice);
    };

    // Aplanar todos los productos de todas las órdenes del cierre
    const flatProducts: FlatProduct[] = useMemo(() =>
    {
        if (!cashClosing?.orders) return [];

        const result: FlatProduct[] = [];

        for (const orderRelation of cashClosing.orders)
        {
            const order = orderRelation.order;
            if (!order?.details) continue;

            for (const detail of order.details as DetailOrder[])
            {
                result.push({
                    orderNumId: order.numId,
                    productName: detail.product?.name ?? detail.productId ?? 'N/A',
                    categoryName: detail.product?.category?.name ?? '—',
                    quantity: detail.quantity,
                    price: detail.price,
                });
            }
        }

        return result;
    }, [cashClosing]);

    const filteredProducts = useMemo(() =>
    {
        if (!selectedCategory) return flatProducts;
        return flatProducts.filter(p => p.categoryName === selectedCategory);
    }, [flatProducts, selectedCategory]);

    // Categorías disponibles en los productos precargados
    const availableCategories = useMemo(() =>
    {
        const names = flatProducts.map(p => p.categoryName).filter(n => n !== '—');
        return [...new Set(names)];
    }, [flatProducts]);

    // Unión: categorías de los productos precargados + todas las del catálogo
    const allCategories = useMemo(() =>
    {
        const catalogNames = categoryData
            ? (Array.isArray(categoryData) ? categoryData : Object.values(categoryData)).map((c: CategoryProduct) => c.name)
            : [];
        return [...new Set([...availableCategories, ...catalogNames])].sort();
    }, [availableCategories, categoryData]);

    if (error) return <div className={styles.error}>Error al cargar los productos</div>;
    if (!cashClosing) return <div className={styles.loading}>Cargando productos...</div>;

    return (
        <div className={styles.products}>
            <div className={styles.header}>
                <div>
                    <h2>Productos del Cierre</h2>
                    <p>Total de líneas: {filteredProducts.length}</p>
                </div>

                {/* Selector de categoría */}
                <div className={styles.categoryFilter}>
                    <label htmlFor="categorySelect">Categoría:</label>
                    <select
                        id="categorySelect"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className={styles.categorySelect}
                    >
                        <option value="">Todas las categorías</option>
                        {allCategories.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className={styles.empty}>
                    {selectedCategory
                        ? `No hay productos de la categoría "${selectedCategory}" en este cierre`
                        : 'No hay productos asociados a este cierre'}
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Orden #</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((row, idx) => (
                                <tr key={idx}>
                                    <td>#{row.orderNumId}</td>
                                    <td>{row.productName}</td>
                                    <td>
                                        <span className={styles.categoryBadge}>{row.categoryName}</span>
                                    </td>
                                    <td>{row.quantity}</td>
                                    <td>{formatPrice(row.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CashClosingProducts;

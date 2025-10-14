'use client';
import { useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import styles from './storefilter.module.css';

interface Store {
    id: string;
    name: string;
    type: string;
}

interface StoreFilterProps {
    selectedStoreId: string;
    onStoreChange: (storeId: string) => void;
}

const StoreFilter = ({ selectedStoreId, onStoreChange }: StoreFilterProps) =>
{
    const { data: stores, isLoading, error, execute } = useFetch<Store[]>('/api/store/', {
        immediate: false
    });

    useEffect(() =>
    {
        execute();
    }, []);

    if (isLoading) return <div className={styles.loading}>Cargando tiendas...</div>;

    if (error) return <div className={styles.error}>Error cargando tiendas</div>;

    return (
        <div className={styles.filterContainer}>
            <label htmlFor="storeFilter" className={styles.label}>
                Filtrar por tienda:
            </label>
            <select
                id="storeFilter"
                className={styles.select}
                value={selectedStoreId}
                onChange={(e) => onStoreChange(e.target.value)}
            >
                <option value="">Todas las tiendas</option>
                {Array.isArray(stores) && stores.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name} {store.type === 'PRINCIPAL' ? '(Principal)' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default StoreFilter;
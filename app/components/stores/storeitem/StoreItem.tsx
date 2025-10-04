'use client';

import styles from './storeitem.module.css';
import { useRouter } from 'next/navigation';
import { Store } from '@/interfaces/interfaces';

interface StoreItemProps {
    store: Store
}

const StoreItem = ({ store }: StoreItemProps) =>
{
    const router = useRouter();

    const getUrl = () =>
    {
        return `/dashboard/stores/${store.id}`;
    }

    return (
        <div className={styles.storeItemContainer}>
            <div className={styles.branchContainer}>
                <h3 className={styles.branchName}>{store.type}</h3>
            </div>

            <div className={styles.storeItemRight}>
                <div className={styles.detailsContainer}>
                    <h2 className={styles.storeName}>{store.name}</h2>
                    <p className={styles.address}><span>Dirección:</span> {store.address}</p>
                    <p className={styles.cityPostal}><span>Estado:</span> {(store.available) ? 'Abierto' : 'Cerrado'}</p>
                    <p className={styles.phone}><span>Teléfono:</span> {store.phone}</p>
                </div>

                <div className={styles.actionContainer}>
                    <button onClick={() => router.push(getUrl())} className={styles.editButton}>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreItem;
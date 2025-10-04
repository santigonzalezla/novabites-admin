'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import StoreSection from '@/app/components/stores/storesection/StoreSection';


const Store = () =>
{
    return (
        <div className={styles.store}>
            <StoreSection />
        </div>
    )
}

export default Store;
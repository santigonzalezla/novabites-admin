'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import StoreSection from '@/app/components/stores/storesection/StoreSection';
import ClientSection from '@/app/components/clients/clientsection/ClientSection';


const Client = () =>
{
    return (
        <div className={styles.store}>
            <ClientSection />
        </div>
    )
}

export default Client;
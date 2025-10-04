'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import StoreSection from '@/app/components/stores/storesection/StoreSection';
import ClientSection from '@/app/components/clients/clientsection/ClientSection';


const Client = () =>
{
    // Aquí puedes usar el ID del producto para cargar los datos específicos del producto

    const { id } = useParams();

    return (
        <div className={styles.store}>
            <ClientSection />
        </div>
    )
}

export default Client;
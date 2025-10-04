'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import SupplierSection from '@/app/components/supplier/suppliersection/SupplierSection';


const Supplier = () =>
{
    // Aquí puedes usar el ID del producto para cargar los datos específicos del producto

    const { id } = useParams();

    return (
        <div className={styles.provider}>
            <SupplierSection />
        </div>
    )
}

export default Supplier;
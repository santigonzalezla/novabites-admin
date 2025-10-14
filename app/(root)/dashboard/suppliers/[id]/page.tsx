'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import SupplierSection from '@/app/components/supplier/suppliersection/SupplierSection';


const Supplier = () =>
{
    return (
        <div className={styles.provider}>
            <SupplierSection />
        </div>
    )
}

export default Supplier;
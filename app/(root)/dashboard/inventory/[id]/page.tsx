'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import ProductSection from '@/app/components/inventory/productsection/ProductSection';


const Product = () =>
{
    return (
        <div className={styles.product}>
            <ProductSection />
        </div>
    )
}

export default Product;
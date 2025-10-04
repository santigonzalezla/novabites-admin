'use client';

import styles from './page.module.css';
import CustomOrderSection from '@/app/components/customorders/customordersection/CustomOrderSection';


const Order = () =>
{
    return (
        <div className={styles.orders}>
            <CustomOrderSection />
        </div>
    )
}

export default Order;
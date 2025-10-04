'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import OrderSection from '@/app/components/orders/ordersection/OrderSection';


const Order = () =>
{
    return (
        <div className={styles.orders}>
            <OrderSection />
        </div>
    )
}

export default Order;
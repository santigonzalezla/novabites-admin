'use client';

import styles from './ordersection.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import { useState } from 'react';
import ProductContent from '@/app/components/inventory/productcontent/ProductContent';
import ProductSupply from '@/app/components/inventory/productsupply/ProductSupply';
import OrderContent from '@/app/components/orders/ordercontent/OrderContent';
import OrderBill from '@/app/components/orders/orderbill/OrderBill';

const tabs = [
    "Resumen",
    "Factura",
    "Historial"
]

const OrderSection = () =>
{
    const [active, setActive] = useState("Resumen");
    const [id, setId] = useState("");

    const handleTabClick = (index: string) => setActive(index);

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>Orden #: {id}</h1>
                <div className={styles.actions}>
                    <button className={styles.downloadButton}>Download</button>
                </div>
            </div>

            <div className={styles.navigation}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.navItem} ${active === tab ? styles.active : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {active === "Resumen" ? (
                <OrderContent setId={setId} />
            ) : active === "Factura" ? (
                <OrderBill />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default OrderSection;
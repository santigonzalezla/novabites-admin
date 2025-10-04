'use client';

import styles from './customordersection.module.css';
import { useState } from 'react';
import OrderBill from '@/app/components/orders/orderbill/OrderBill';
import CustomOrderContent from '@/app/components/customorders/customordercontent/CustomOrderContent';

const tabs = [
    "Resumen",
    "Factura",
    "Historial"
]

const CustomOrderSection = () =>
{
    const [active, setActive] = useState("Resumen");
    const [id, setId] = useState("");

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>Orden Personalizada #: {id}</h1>
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
                <CustomOrderContent setId={setId} />
            ) : active === "Factura" ? (
                <OrderBill orderId={"ORD-0019"} />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default CustomOrderSection;
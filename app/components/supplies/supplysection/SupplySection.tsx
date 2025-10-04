'use client';

import styles from './supplysection.module.css';
import { useState } from 'react';
import SupplyContent from '@/app/components/supplies/supplycontent/SupplyContent';
import SupplyProduct from '@/app/components/supplies/supplyproduct/SupplyProduct';

const tabs = [
    "Resumen",
    "Productos",
    "Historial"
]

const SupplySection = () =>
{
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    const handleSetData = (id: string, name: string) => setData({ id, name });

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>{data.name} - ID: {data.id}</h1>
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
                <SupplyContent setData={handleSetData}/>
            ) : active === "Productos" ? (
                <SupplyProduct />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default SupplySection;
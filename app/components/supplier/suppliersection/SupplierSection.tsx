'use client';

import styles from './suppliersection.module.css';
import { useState } from 'react';
import SupplierContent from '@/app/components/supplier/suppliercontent/SupplierContent';
import ProductSupplier from '@/app/components/supplier/productsupplier/ProductSupplier';

const tabs = [
    "Resumen",
    "Insumos",
    "Historial"
]

const SupplierSection = () =>
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
                <h1>{data.name} - ID#: {data.id}</h1>
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
                <SupplierContent setData={handleSetData} />
            ) : active === "Insumos" ? (
                <ProductSupplier />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default SupplierSection;
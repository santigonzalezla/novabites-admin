'use client';

import styles from './productsection.module.css';
import { useState } from 'react';
import ProductContent from '@/app/components/inventory/productcontent/ProductContent';
import ProductSupply from '@/app/components/inventory/productsupply/ProductSupply';

const tabs = [
    "Resumen",
    "Insumos",
    "Historial"
]

const ProductSection = () =>
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
                    <button className={styles.downloadButton}>Descargar</button>
                    <button className={styles.deleteButton}>Eliminar</button>
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
                <ProductContent setData={handleSetData} />
            ) : active === "Insumos" ? (
                <ProductSupply />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default ProductSection;
'use client';

import styles from './storesection.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import { useState } from 'react';
import StoreContent from '@/app/components/stores/storecontent/StoreContent';
import StoreUser from '@/app/components/stores/storeuser/StoreUser';

const tabs = [
    "Resumen",
    "Usuarios",
    "Historial"
]

const StoreSection = () =>
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
                <StoreContent setData={handleSetData}/>
            ) : active === "Usuarios" ? (
                <StoreUser />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default StoreSection;
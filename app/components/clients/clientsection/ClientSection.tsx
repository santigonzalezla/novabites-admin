'use client';

import styles from './clientsection.module.css';
import { useState } from 'react';
import StoreUser from '@/app/components/stores/storeuser/StoreUser';
import ClientContent from '@/app/components/clients/clientcontent/ClientContent';

const tabs = [
    "Resumen",
]

const ClientSection = () =>
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

            <ClientContent setData={handleSetData} />
        </div>
    );
}

export default ClientSection;
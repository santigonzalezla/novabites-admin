'use client';

import styles from './storesection.module.css';
import { useState } from 'react';
import StoreContent from '@/app/components/stores/storecontent/StoreContent';
import StoreProduct from '@/app/components/stores/storeproduct/StoreProduct';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';

const tabs = [
    "Resumen",
    "Inventario",
    "Historial"
]

const StoreSection = () =>
{
    const pathname = usePathname();
    const storeId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/store/export', {
        immediate: false
    });

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
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="store"
                        domainId={storeId || ''}
                    />
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
                <StoreContent setData={handleSetData}/>
            ) : active === "Inventario" ? (
                <StoreProduct />
            ) : (
                <h1>Historial</h1>
            )}
        </div>
    );
}

export default StoreSection;
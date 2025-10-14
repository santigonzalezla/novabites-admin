'use client';

import styles from './supplysection.module.css';
import { useState } from 'react';
import SupplyContent from '@/app/components/supplies/supplycontent/SupplyContent';
import SupplyProduct from '@/app/components/supplies/supplyproduct/SupplyProduct';
import SupplyLog from '@/app/components/supplies/supplylog/SupplyLog';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';

const tabs = [
    "Resumen",
    "Productos",
    "Historial"
]

const SupplySection = () =>
{
    const pathname = usePathname();
    const supplyId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/supply/export', {
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
                <h1>{data.name} - ID: {data.id}</h1>
                <div className={styles.actions}>
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="supply"
                        domainId={supplyId || ''}
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
                <SupplyContent setData={handleSetData}/>
            ) : active === "Productos" ? (
                <SupplyProduct />
            ) : (
                <SupplyLog />
            )}
        </div>
    );
}

export default SupplySection;
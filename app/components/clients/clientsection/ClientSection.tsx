'use client';

import styles from './clientsection.module.css';
import { useState } from 'react';
import StoreUser from '@/app/components/stores/storeuser/StoreUser';
import ClientContent from '@/app/components/clients/clientcontent/ClientContent';
import ClientLog from '@/app/components/clients/clientlog/ClientLog';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';

const tabs = [
    "Resumen",
    "Historial"
]

const ClientSection = () =>
{
    const pathname = usePathname();
    const clientId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/client/export', {
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
                        domain="client"
                        domainId={clientId || ''}
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
                <ClientContent setData={handleSetData} />
            ) : (
                <ClientLog />
            )}
        </div>
    );
}

export default ClientSection;
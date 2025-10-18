'use client';

import styles from './requestsection.module.css';
import { useState } from 'react';
import RequestContent from '@/app/components/requests/requestcontent/RequestContent';
import RequestLog from '@/app/components/requests/requestlog/RequestLog';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import RequestProduct from '@/app/components/requests/requestproduct/RequestProduct';

const tabs = [
    "Resumen",
    "Productos",
    "Historial"
]

const RequestSection = () =>
{
    const pathname = usePathname();
    const storeRequestId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [id, setId] = useState("");
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/store-request/export', {
        immediate: false
    });

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>Solicitud #: {id}</h1>
                <div className={styles.actions}>
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="store-request"
                        domainId={storeRequestId || ''}
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
                <RequestContent setId={setId} />
            ) : active === "Productos" ? (
                <RequestProduct />
            ) : (
                <RequestLog />
            )}
        </div>
    );
}

export default RequestSection;
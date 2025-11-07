'use client';

import styles from './cashclosingsection.module.css';
import { useState } from 'react';
import RequestContent from '@/app/components/requests/requestcontent/RequestContent';
import RequestLog from '@/app/components/requests/requestlog/RequestLog';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import RequestProduct from '@/app/components/requests/requestproduct/RequestProduct';
import CashClosingContent from '@/app/components/cashclosing/cashclosingcontent/CashClosingContent';
import CashClosingProduct from '@/app/components/cashclosing/cashclosingproducts/CashClosingProduct';
import CashClosingExpenses from '@/app/components/cashclosing/cashclosingexpenses/CashClosingExpenses';

const tabs = [
    "Resumen",
    "Productos",
    "Gastos",
    "Historial"
]

const CashClosingSection = () =>
{
    const pathname = usePathname();
    const cashClosingId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [id, setId] = useState("");

    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/cash-closing/export', {
        immediate: false
    });

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>Cierre de Caja #: {id}</h1>
                <div className={styles.actions}>
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="cash-closing"
                        domainId={cashClosingId || ''}
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
                <CashClosingContent setId={setId} />
            ) : active === "Productos" ? (
                <CashClosingProduct />
            ) : active === "Gastos" ? (
                <CashClosingExpenses />
            ) : (
                <RequestLog />
            )}
        </div>
    );
}

export default CashClosingSection;
'use client';

import styles from './customordersection.module.css';
import { useState } from 'react';
import OrderBill from '@/app/components/orders/orderbill/OrderBill';
import CustomOrderContent from '@/app/components/customorders/customordercontent/CustomOrderContent';
import CustomOrderLog from '@/app/components/customorders/customorderlog/CustomOrderLog';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';

const tabs = [
    "Resumen",
    "Factura",
    "Historial"
]

const CustomOrderSection = () =>
{
    const pathname = usePathname();
    const customOrderId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [id, setId] = useState("");
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/client/export', {
        immediate: false
    });

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>Orden Personalizada #: {id}</h1>
                <div className={styles.actions}>
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="custom-order"
                        domainId={customOrderId || ''}
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
                <CustomOrderContent setId={setId} />
            ) : active === "Factura" ? (
                <OrderBill />
            ) : (
                <CustomOrderLog />
            )}
        </div>
    );
}

export default CustomOrderSection;
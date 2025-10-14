'use client';

import styles from './suppliersection.module.css';
import { useState } from 'react';
import SupplierContent from '@/app/components/supplier/suppliercontent/SupplierContent';
import ProductSupplier from '@/app/components/supplier/productsupplier/ProductSupplier';
import SupplierLog from '@/app/components/supplier/supplierlog/SupplierLog';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';

const tabs = [
    "Resumen",
    "Insumos",
    "Historial"
]

const SupplierSection = () =>
{
    const pathname = usePathname();
    const supplierId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/supplier/export', {
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
                        domain="supplier"
                        domainId={supplierId || ''}
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
                <SupplierContent setData={handleSetData} />
            ) : active === "Insumos" ? (
                <ProductSupplier />
            ) : (
                <SupplierLog />
            )}
        </div>
    );
}

export default SupplierSection;
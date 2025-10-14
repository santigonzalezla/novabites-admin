'use client';

import styles from './productsection.module.css';
import { useState } from 'react';
import ProductContent from '@/app/components/inventory/productcontent/ProductContent';
import ProductSupply from '@/app/components/inventory/productsupply/ProductSupply';
import ProductLog from '../productlog/ProductLog';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';

const tabs = [
    "Resumen",
    "Insumos",
    "Historial"
]

const ProductSection = () =>
{
    const pathname = usePathname();
    const productId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ id: "", name: ""});
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/product/export', {
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
                        domain="product"
                        domainId={productId || ''}
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
                <ProductContent setData={handleSetData} />
            ) : active === "Insumos" ? (
                <ProductSupply />
            ) : (
                <ProductLog />
            )}
        </div>
    );
}

export default ProductSection;
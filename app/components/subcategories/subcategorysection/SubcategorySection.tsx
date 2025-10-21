'use client';

import styles from './categorysection.module.css';
import { useState } from 'react';
import SupplierContent from '@/app/components/supplier/suppliercontent/SupplierContent';
import ProductSupplier from '@/app/components/supplier/productsupplier/ProductSupplier';
import CategoryContent from '@/app/components/categories/categorycontent/CategoryContent';
import CategoriesLog from '@/app/components/categories/categorieslog/CategoriesLog';
import DownloadUnitButton from '@/app/components/shared/downloadunitbutton/DownloadUnitButton';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import SubcategoryContent from '@/app/components/subcategories/subcategorycontent/SubcategoryContent';

const tabs = [
    "Resumen",
    "Historial"
]

const SubcategorySection = () =>
{
    const pathname = usePathname();
    const categoryId = pathname.split('/').pop();
    const [isGenerating, setIsGenerating] = useState(false);
    const [active, setActive] = useState("Resumen");
    const [data, setData] = useState({ name: "" });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/subcategory-product/export', {
        immediate: false
    });

    const handleTabClick = (index: string) =>
    {
        setActive(index);
    };

    const handleSetData = (name: string) => setData({ name });

    return (
        <div className={styles.productsection}>
            <div className={styles.header}>
                <h1>{data.name}</h1>
                <div className={styles.actions}>
                    <DownloadUnitButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="category-product"
                        domainId={categoryId || ''}
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
                <SubcategoryContent setData={handleSetData} />
            ) : (
                <CategoriesLog />
            )}
        </div>
    );
}

export default SubcategorySection;
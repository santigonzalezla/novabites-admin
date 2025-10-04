"use client"

import { useEffect, useState } from 'react';
import styles from "./productsupply.module.css"
import { Download, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import { ProductSupply as SupplyProductData } from '@/interfaces/interfaces';
import SupplyProductTable from '@/app/components/supplies/supplyproducttable/SupplyProductTable';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface SupplyProductConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}
const SupplyProduct = () =>
{
    const pathname = usePathname();
    const supplyId = pathname.split('/').pop();
    const [supplyProductData, setSupplyProductData] = useState<SupplyProductData[]>([]);
    const [config, setConfig] = useState<SupplyProductConfig>({columns: []});
    const { error, execute } = useFetch<SupplyProductData[]>(`/api/product-supply/supply/${supplyId}`, {
        immediate: false,
    });

    useEffect(() =>
    {
        if (error)
        {
            console.error("Error al cargar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        try
        {
            const fetchSupplyProducts = async () =>
            {
                const supplyProducts = await execute();

                if (supplyProducts)
                {
                    setSupplyProductData(supplyProducts);
                }
            }

            fetchSupplyProducts();
            setConfig(mockData.supplyproduct.config);
        }
        catch (error)
        {
            console.error("Error al procesar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    return (
        <div className={styles.productsupply}>
            <div className={styles.header}>
                <div className={styles.productsupplyactions}>
                    <button className={styles.upload}><Upload /></button>
                    <button className={styles.download}><Download /></button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <SupplyProductTable data={supplyProductData} config={config} />
            </div>
        </div>
    )
}

export default SupplyProduct;
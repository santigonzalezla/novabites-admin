"use client"

import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from "./productsupplier.module.css"
import { Download, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import { useFetch } from '@/hooks/useFetch';
import { PaginatedResponse, Product, ProductSupply as ProductSupplyData, Supply } from '@/interfaces/interfaces';
import { usePathname } from 'next/navigation';
import ProductSupplierTable from '@/app/components/supplier/productsuppliertable/ProductSupplierTable';
import { toast } from 'sonner';

interface ProductSupplyConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const ProductSupplier = () =>
{
    const pathname = usePathname();
    const supplierId = pathname.split('/').pop();
    const [config, setConfig] = useState<ProductSupplyConfig>({columns: []});
    const [productSupplierData, setProductSupplierData] = useState<Product[]>([]);
    const { data: productsResponse, error, execute } = useFetch<PaginatedResponse<Product>>(`/api/product?supplierId=${supplierId}&limit=500`);
    const data = productsResponse?.data ?? null;

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
            return;
        }
        try
        {
            if (data)
            {
                setProductSupplierData(data);
            }
            setConfig(mockData.productsupplier.config);
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
    }, [data]);

    return (
        <div className={styles.productsupply}>
            <div className={styles.header}>
                <div className={styles.productsupplyactions}>
                    <button className={styles.upload}><Upload /></button>
                    <button className={styles.download}><Download /></button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <ProductSupplierTable data={productSupplierData} config={config} />
            </div>
        </div>
    )
}

export default ProductSupplier;
"use client"

import { useEffect, useState } from 'react';
import styles from "./requestsupply.module.css"
import { Download, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import { ProductSupply as storeRequestData, StoreRequest } from '@/interfaces/interfaces';
import SupplyProductTable from '@/app/components/supplies/supplyproducttable/SupplyProductTable';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface StoreRequestConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}
const RequestProduct = () =>
{
    const pathname = usePathname();
    const requestId = pathname.split('/').pop();
    const [storeRequestData, setStoreRequestData] = useState<StoreRequest[]>([]);
    const [config, setConfig] = useState<StoreRequestConfig>({columns: []});
    const { error, execute } = useFetch<StoreRequest[]>(`/api/store-request/${requestId}`, {
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
            const fetchStoreRequest = async () =>
            {
                const storeRequests = await execute();

                if (storeRequests)
                {
                    console.log(storeRequests);
                    setStoreRequestData(storeRequests);
                }
            }

            fetchStoreRequest();
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
                <SupplyProductTable data={storeRequestData} config={config} />
            </div>
        </div>
    )
}

export default RequestProduct;
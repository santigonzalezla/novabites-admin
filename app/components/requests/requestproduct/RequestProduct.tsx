"use client"

import { useEffect, useMemo, useState } from 'react';
import styles from "./requestsupply.module.css"
import { Download, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import { Product, StoreRequest, StoreRequestDetail } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import RequestProductTable from '@/app/components/requests/requestproducttable/RequestProductTable';
import RequestStepper from '@/app/components/requests/requeststepper/RequestStepper';

interface StoreRequestConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

interface EnrichedStoreRequestDetail extends StoreRequestDetail {
    product?: Product;
}

const RequestProduct = () =>
{
    const pathname = usePathname();
    const requestId = pathname.split('/').pop();
    const [storeRequestData, setStoreRequestData] = useState<StoreRequest | null>(null);
    const [requestDetails, setRequestDetails] = useState<StoreRequestDetail[]>([]);
    const [config, setConfig] = useState<StoreRequestConfig>({columns: []});
    const { error, execute } = useFetch<StoreRequest>(`/api/store-request/${requestId}`, {
        immediate: false,
    });
    const { data: productData, error: productError } = useFetch(`/api/product`);

    const enrichedDetails = useMemo(() =>
    {
        if (!requestDetails.length || !productData) return [];

        return requestDetails.map(detail =>
        {
            const product = productData.find((p: { id: string; }) => p.id === detail.productId);

            return {
                ...detail,
                product: product || {
                    id: detail.productId,
                    numId: 0,
                    name: 'Producto no encontrado',
                    basePrice: '0'
                }
            } as EnrichedStoreRequestDetail;
        });
    }, [requestDetails, productData]);

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
                const storeRequest = await execute();

                if (storeRequest)
                {
                    setStoreRequestData(storeRequest);

                    if (storeRequest.details && storeRequest.details.length > 0)
                    {
                        setRequestDetails(storeRequest.details as StoreRequestDetail[]);
                    }
                    else
                    {
                        toast.info("No hay productos en esta solicitud", {
                            description: "Esta solicitud no contiene productos.",
                            duration: 3000,
                            richColors: true,
                            position: 'top-right'
                        });
                    }
                }
            }

            fetchStoreRequest();
            setConfig(mockData.requestProduct.config);
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
                {storeRequestData && (
                    <RequestStepper
                        currentStatus={storeRequestData.status}
                        requestedDate={storeRequestData.requestedDate}
                        approvedDate={storeRequestData.approvedDate}
                        completedDate={storeRequestData.completedDate}
                    />
                )}
            </div>

            <div className={styles.tableContainer}>
                <RequestProductTable data={enrichedDetails} config={config} />
            </div>
        </div>
    )
}

export default RequestProduct;
"use client"

import { useEffect, useMemo, useState } from 'react';
import styles from "./requestsupply.module.css"
import mockData from '@/app/components/shared/data/mockData.json';
import { PaginatedResponse, Product, StoreRequest, StoreRequestDetail } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import RequestProductTable from '@/app/components/requests/requestproducttable/RequestProductTable';
import RequestStepper from '@/app/components/requests/requeststepper/RequestStepper';
import { RequestStatus, RequestType } from '@/interfaces/enums';

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
    const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});
    const [isApproving, setIsApproving] = useState(false);
    const { error, execute } = useFetch<StoreRequest>(`/api/store-request/${requestId}`, {
        immediate: false,
    });
    const { execute: patchExecute } = useFetch(`/api/store-request/${requestId}`, {
        immediate: false,
    });
    const { data: productsResponse, error: productError } = useFetch<PaginatedResponse<Product>>(`/api/product?limit=500`);
    const productData = productsResponse?.data ?? null;

    const isPendingSupply =
        storeRequestData?.status === RequestStatus.PENDING &&
        storeRequestData?.type === RequestType.SUPPLY_REQUEST;

    const enrichedDetails = useMemo(() =>
    {
        if (!requestDetails.length || !productData) return [];

        return requestDetails.map(detail =>
        {
            const product = productData.find((p: { id: string; }) => p.id === detail.productId);

            return {
                ...detail,
                approvedQuantity: isPendingSupply
                    ? (approvedQuantities[detail.id] ?? detail.requestedQuantity)
                    : detail.approvedQuantity,
                product: product || {
                    id: detail.productId,
                    numId: 0,
                    name: 'Producto no encontrado',
                    basePrice: '0'
                }
            } as EnrichedStoreRequestDetail;
        });
    }, [requestDetails, productData, approvedQuantities, isPendingSupply]);

    const tableConfig = useMemo((): StoreRequestConfig =>
    {
        const baseColumns = [
            { key: "product.numId", header: "CÓDIGO", width: "8%" },
            { key: "product.name", header: "PRODUCTO", width: "22%" },
            { key: "product.category.name", header: "CATEGORÍA", width: "15%" },
            { key: "requestedQuantity", header: "CANT. SOLICITADA", width: "15%" },
        ];

        const approvedColumn = isPendingSupply
            ? { key: "approvedQuantity", header: "CANT. APROBADA", width: "14%", renderType: "editable-number" as const }
            : storeRequestData?.status !== RequestStatus.PENDING
                ? { key: "approvedQuantity", header: "CANT. APROBADA", width: "14%" }
                : null;

        const priceColumns = [
            { key: "unitPrice", header: "PRECIO UNIT.", width: "13%", renderType: "currency" as const },
            { key: "totalPrice", header: "TOTAL", width: "13%", renderType: "currency" as const },
        ];

        return {
            columns: approvedColumn
                ? [...baseColumns, approvedColumn, ...priceColumns]
                : [...baseColumns, ...priceColumns],
            itemsPerPage: 4,
            pageLabels: { showing: "Mostrando", of: "de" }
        };
    }, [isPendingSupply, storeRequestData?.status]);

    useEffect(() =>
    {
        if (error)
        {
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const fetchStoreRequest = async () =>
        {
            try
            {
                const storeRequest = await execute();

                if (storeRequest)
                {
                    setStoreRequestData(storeRequest);

                    if (storeRequest.details && storeRequest.details.length > 0)
                    {
                        const details = storeRequest.details as StoreRequestDetail[];
                        setRequestDetails(details);

                        // Initialize approvedQuantities from existing data or default to requestedQuantity
                        const initial: Record<string, number> = {};
                        details.forEach(d =>
                        {
                            initial[d.id] = d.approvedQuantity ?? d.requestedQuantity;
                        });
                        setApprovedQuantities(initial);
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
            catch (err)
            {
                toast.error(`Error al cargar los datos: ${err}`, {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        };

        fetchStoreRequest();
    }, []);

    const handleCellChange = (rowId: string, key: string, value: number) =>
    {
        if (key === 'approvedQuantity')
        {
            setApprovedQuantities(prev => ({ ...prev, [rowId]: value }));
        }
    };

    const handleApprove = async () =>
    {
        setIsApproving(true);
        try
        {
            const details = requestDetails.map(d => ({
                id: d.id,
                approvedQuantity: approvedQuantities[d.id] ?? d.requestedQuantity
            }));

            const result = await patchExecute({
                method: 'PATCH',
                body: { status: RequestStatus.APPROVED, details }
            });

            if (!result) throw new Error('Error al aprobar');

            toast.success('Solicitud aprobada', {
                description: 'Las cantidades aprobadas han sido guardadas correctamente.',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });

            // Reload data
            const updated = await execute();
            if (updated)
            {
                setStoreRequestData(updated);
                setRequestDetails(updated.details as StoreRequestDetail[]);
            }
        }
        catch (e)
        {
            toast.error('Error al aprobar la solicitud', {
                description: 'No se pudo aprobar la solicitud.',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsApproving(false);
        }
    };

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
                <RequestProductTable
                    data={enrichedDetails}
                    config={tableConfig}
                    onCellChange={isPendingSupply ? handleCellChange : undefined}
                />
            </div>

            {isPendingSupply && (
                <div className={styles.approveBar}>
                    <span className={styles.approveInfo}>
                        Ajusta las cantidades aprobadas antes de aprobar la solicitud.
                        Si no modificas una cantidad, se usará la solicitada.
                    </span>
                    <button
                        className={styles.approveButton}
                        onClick={handleApprove}
                        disabled={isApproving}
                    >
                        {isApproving ? 'Aprobando...' : 'Aprobar solicitud'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default RequestProduct;

'use client';

import { useEffect, useState } from 'react';
import styles from './orderbill.module.css';
import { Printer } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import BillOrderTable from '@/app/components/orders/billordertable/BillOrderTable';
import { usePathname } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { Bill, DetailBill } from '@/interfaces/interfaces';

interface BillDetailsConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const OrderBill = () =>
{
    const pathname = usePathname();
    const [isPrinting, setIsPrinting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const orderId = pathname.split('/').pop();
    const [billData, setBillData] = useState<Bill>();
    const [billDetailsData, setBillDetailsData] = useState<DetailBill[]>([]);
    const [config, setConfig] = useState<BillDetailsConfig>({columns: []});
    const { error, isLoading, execute } = useFetch<Bill>(`/api/bill/order/${orderId}`, {
        immediate: false,
    });
    const { error: errorPdf, isLoading: isLoadingPdf, execute: executePdf } = useFetch<Blob>(`/api/bill/generate`, {
        immediate: false,
        responseType: 'blob',
        method: 'POST'
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
            const fetchBill = async () =>
            {
                const bill = await execute();

                if (bill)
                {
                    setBillData(bill);
                    setBillDetailsData(bill.details || []);
                }
            }

            fetchBill();
            setConfig(mockData.billDetails.config);
        }
        catch (e)
        {
            console.error("Error al procesar los datos:", e);
            toast.error('Error al cargar los datos', {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const downloadFile = (blob: Blob, filename: string) =>
    {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = async () =>
    {
        setIsGenerating(true);

        try
        {
            if (!billData)
            {
                toast.error('No se encontró la factura para esta orden', {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                setIsGenerating(false);
                return;
            }

            const pdfBlob = await executePdf({
                body: { billId: billData?.id }
            });

            if (pdfBlob)
            {
                const filename = `factura_${billData.billNumber || billData.id}_${new Date().toISOString().split('T')[0]}.pdf`;

                downloadFile(pdfBlob as Blob, filename);

                toast.success('PDF generado exitosamente', {
                    description: "El archivo se ha descargado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
            else
            {
                toast.error('Error al generar PDF', {
                    description: "No se pudo generar el archivo PDF.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (error)
        {
            console.error('Error generando PDF:', error);
            toast.error('Error generando PDF', {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsGenerating(false);
        }
    }

    const handlePrint = async () =>
    {
        setIsPrinting(true);

        try
        {
            console.log('Imprimiendo PDF...');
        }
        catch (error)
        {
            console.error('Error imprimiendo PDF:', error);
            toast.error('Error imprimiendo PDF', {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsPrinting(false);
        }

    };

    const subtotal = billData?.details?.reduce((acc, item) =>
    {
        return acc + Number.parseFloat(String(item.unitPrice)) * item.quantity;
    }, 0);

    const totalDiscount = billData?.details?.reduce((acc, item) =>
    {
        return acc + Number.parseFloat(String(item.discount || 0));
    }, 0);

    const total = Number.parseFloat(String(billData?.totalPrice || 0));
    const formatAmount = (value: number) => value.toLocaleString('es-CO');

    return (
        <div className={styles.billContent}>
            <div className={styles.billHeader}>
                <div className={styles.billInfo}>
                    <h2>Factura #{billData?.numId}</h2>
                    <p>ID: {billData?.billNumber}</p>
                    <p>Fecha: {new Date(billData?.createdAt || "").toLocaleDateString()}</p>
                    <p>Orden relacionada: {billData?.order?.numId}</p>
                </div>
                <div className={styles.billDetails}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tienda:</span>
                        <div className={styles.detailItemContent}>
                            <span className={styles.detailValue}>{billData?.store?.numId}</span>
                            <span className={styles.detailValue}>{billData?.store?.name}</span>
                        </div>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Usuario:</span>
                        <div className={styles.detailItemContent}>
                            <span className={styles.detailValue}>{billData?.user?.numId}</span>
                            <span className={styles.detailValue}>{billData?.user?.name}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.billButtons}>
                    <button className={styles.printButton} onClick={handleDownloadPdf} disabled={isPrinting}>
                        <Printer />
                        {isGenerating ? "Generando..." : "Descargar PDF"}
                    </button>
                    <button className={styles.printButton} onClick={handlePrint} disabled={isPrinting}>
                        <Printer />
                        {isPrinting ? "Imprimiendo..." : "Imprimir Factura"}
                    </button>
                </div>
            </div>

            <div className={styles.billBottom}>
                <div className={styles.billTableContianer}>
                    <BillOrderTable  data={billDetailsData} config={config} />
                </div>

                <div className={styles.billSummary}>
                    <div className={styles.summaryItem}>
                        <span>Subtotal:</span>
                        <span>${formatAmount(subtotal || 0)}</span>
                    </div>
                    {(totalDiscount || 0) > 0 && (
                        <div className={styles.summaryItem}>
                            <span>Descuentos:</span>
                            <span style={{ color: '#FF7A00' }}>-${formatAmount(totalDiscount || 0)}</span>
                        </div>
                    )}
                    <div className={`${styles.summaryItem} ${styles.totalItem}`}>
                        <span>Total:</span>
                        <span>${formatAmount(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderBill;

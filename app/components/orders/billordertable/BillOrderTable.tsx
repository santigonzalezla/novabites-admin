'use client';

import styles from './datatable.module.css';
import { ReactNode, useState } from 'react';
import { Edit, Trash } from '@/app/components/svg';
import { formatDateShort } from '@/lib/dateUtils';
import { usePathname, useRouter } from 'next/navigation';

export type Column = {
    key: string;
    header: string;
    renderType?: 'date' | 'decimal' | 'currency' | 'discount';
    render?: (value: any, row: any) => ReactNode;
    width?: string;
}

export type TableConfig = {
    columns: Column[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

type DataTableProps = {
    data: any[];
    config: TableConfig;
    className?: string;
}

const BillOrderTable = ({ data, config, className = "" }: DataTableProps) =>
{
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = config.itemsPerPage || 5;

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const statusArr =  [
        "available",
        "unavailable",
        "completed",
        "processing",
        "pending",
        "rejected",
        "cancelled",
        "canceled",
        "on hold",
        "active",
        "inactive",
        "suspended",
        "out of stock",
        "in stock",
        "low stock"
    ];

    // Cambiar página
    const goToNextPage = () =>
    {
        if (currentPage < totalPages)
        {
            setCurrentPage(currentPage + 1);
        }
    }

    const goToPreviousPage = () =>
    {
        if (currentPage > 1)
        {
            setCurrentPage(currentPage - 1);
        }
    }

    const renderStatusBadge = (status: string) =>
    {
        let badgeClass: string;

        switch (status.toLowerCase())
        {
            case "available":
                badgeClass = styles.statusCompleted;
                break;
            case "unavailable":
                badgeClass = styles.statusRejected;
                break;
            case "completed":
                badgeClass = styles.statusCompleted;
                break;
            case "processing":
                badgeClass = styles.statusProcessing;
                break;
            case "pending":
                badgeClass = styles.statusOnHold;
                break;
            case "cancelled":
                badgeClass = styles.statusRejected;
                break;
            case "canceled":
                badgeClass = styles.statusRejected;
                break;
            case "rejected":
                badgeClass = styles.statusRejected;
                break;
            case "on hold":
                badgeClass = styles.statusOnHold;
                break;
            case "suspended":
                badgeClass = styles.statusOnHold;
                break;
            case "active":
                badgeClass = styles.statusCompleted;
                break;
            case "inactive":
                badgeClass = styles.statusRejected;
                break;
            case "out of stock":
                badgeClass = styles.statusRejected;
                break;
            case "in stock":
                badgeClass = styles.statusCompleted;
                break;
            case "low stock":
                badgeClass = styles.statusOnHold;
                break;
            default:
                badgeClass = styles.statusDefault;
        }

        return (<span className={`${styles.statusBadge} ${badgeClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>)
    }

    const renderDateValue = (dateString: string) =>
    {
        try
        {
            return <span className={styles.dateValue}>{formatDateShort(dateString)}</span>;
        }
        catch (error)
        {
            return dateString;
        }
    };

    const renderCurrencyValue = (value: any) =>
    {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `$${numValue.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    // Renderizar valor de celda basado en la configuración de columna
    const renderCellValue = (column: Column, value: any, row: any) =>
    {
        if (column.renderType === 'date' && typeof value === 'string')
        {
            return renderDateValue(value);
        }

        if (column.renderType === 'currency')
        {
            return renderCurrencyValue(value);
        }

        if (column.renderType === 'discount')
        {
            const num = parseFloat(String(value || 0));
            if (num <= 0) return <span style={{ color: '#ABBBC2' }}>—</span>;
            return <span style={{ color: '#FF7A00' }}>-${num.toLocaleString('es-CO')}</span>;
        }

        if (typeof value === 'string' && statusArr.includes(value.toLowerCase()))
        {
            return renderStatusBadge(value);
        }

        if (typeof value === 'boolean')
        {
            return (value ? renderStatusBadge("Available") : renderStatusBadge("Unavailable"));
        }

        if (column.render)
        {
            return column.render(value, row);
        }

        return value;
    }

    const getNestedValue = (obj: any, path: string, defaultValue = null) =>
    {
        try
        {
            return path.split('.').reduce((current: { [x: string]: any; } | null | undefined, key: string | number) =>
            {
                if (current === null || current === undefined) return defaultValue;

                return current[key];
            }, obj) ?? defaultValue;
        }
        catch (error)
        {
            return defaultValue;
        }
    };

    const getUrl = (id: string) =>
    {
        return `/dashboard/inventory/${id}`;
    }

    const { pageLabels = { showing: "Mostrando", of: "de" } } = config;

    return (
        <div className={`${styles.tableContainer} ${className}`}>
            <table className={styles.dataTable}>
                <thead>
                <tr>
                    {config.columns.map((column) => (
                        <th
                            key={column.key}
                            style={column.width ? { width: column.width } : {}}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {currentItems.length > 0 ? (
                    currentItems.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {config.columns.map((column) => (
                                <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                    {renderCellValue(column, getNestedValue(item, column.key), item)}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={config.columns.length + 1} className={styles.emptyTableMessage}>
                            No hay datos disponibles
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <span>
                    {pageLabels.showing} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} {pageLabels.of} {data.length}
                </span>
                <div className={styles.paginationControls}>
                    <button onClick={goToPreviousPage} disabled={currentPage === 1} className={styles.paginationButton}>
                        &lt;
                    </button>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className={styles.paginationButton}>
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BillOrderTable;
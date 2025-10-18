'use client';

import styles from './datatable.module.css';
import { ReactNode, useState } from 'react';
import { Edit, Trash } from '@/app/components/svg';
import { StoreProduct } from '@/interfaces/interfaces';

export type Column = {
    key: string;
    header: string;
    renderType?: 'date' | 'decimal' | 'currency' | 'boolean';
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

type StoreProductTableProps = {
    data: StoreProduct[];
    setIsModalOpen?: (isOpen: boolean) => void;
    setEditingStoreProduct?: (storeProduct: StoreProduct) => void;
    config: TableConfig;
    className?: string;
    handleDeleteStoreProduct?: (storeProductId: string) => void;
}

const StoreProductTable = ({ data, config, className, handleDeleteStoreProduct, setIsModalOpen, setEditingStoreProduct }: StoreProductTableProps) =>
{
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = config.itemsPerPage || 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    console.log(currentItems);

    const statusArr = [
        "available", "unavailable", "completed", "processing", "pending",
        "rejected", "cancelled", "canceled", "on hold", "active",
        "inactive", "suspended", "out of stock", "in stock", "low stock"
    ];

    const goToNextPage = () =>
    {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    }

    const goToPreviousPage = () =>
    {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    }

    const renderStatusBadge = (status: string) =>
    {
        let badgeClass: string;

        switch (status.toLowerCase())
        {
            case "available":
            case "completed":
            case "active":
            case "in stock":
                badgeClass = styles.statusCompleted;
                break;
            case "unavailable":
            case "cancelled":
            case "canceled":
            case "rejected":
            case "inactive":
            case "out of stock":
                badgeClass = styles.statusRejected;
                break;
            case "processing":
                badgeClass = styles.statusProcessing;
                break;
            case "pending":
            case "on hold":
            case "suspended":
            case "low stock":
                badgeClass = styles.statusOnHold;
                break;
            default:
                badgeClass = styles.statusDefault;
        }

        return (
            <span className={`${styles.statusBadge} ${badgeClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </span>
        );
    }

    const renderDateValue = (dateString: string) =>
    {
        try
        {
            const date = new Date(dateString);
            const formattedDate = date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return <span className={styles.dateValue}>{formattedDate}</span>;
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

        if (column.renderType === 'boolean')
        {
            return value ? renderStatusBadge("Available") : renderStatusBadge("Unavailable");
        }

        if (typeof value === 'string' && statusArr.includes(value.toLowerCase()))
        {
            return renderStatusBadge(value);
        }

        if (typeof value === 'boolean')
        {
            return value ? renderStatusBadge("Available") : renderStatusBadge("Unavailable");
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
            return path.split('.').reduce((current, key) =>
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

    const handleEdit = (item: StoreProduct) =>
    {
        console.log('Editing store product:', item);
        if (setIsModalOpen) setIsModalOpen(true);
        if (setEditingStoreProduct) setEditingStoreProduct(item);
        else alert("No se ha proporcionado una función de edición");
    }

    const handleDelete = (storeProductId: string) =>
    {
        console.log(storeProductId);

        if (handleDeleteStoreProduct)
        {
            const confirmed = window.confirm("¿Estás seguro de eliminar este producto de la tienda?");
            if (confirmed)
            {

                handleDeleteStoreProduct(storeProductId);
            }
        }
        else
        {
            alert("No se ha proporcionado una función de eliminación");
        }
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
                    <th style={{width: "15%"}}>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.length > 0 ? (
                    currentItems.map((item, rowIndex) => (
                        <tr key={item.id || rowIndex}>
                            {config.columns.map((column) => (
                                <td
                                    key={`${rowIndex}-${column.key}`}
                                    style={column.width ? { width: column.width } : {}}
                                >
                                    {renderCellValue(column, getNestedValue(item, column.key), item)}
                                </td>
                            ))}
                            <td className={styles.actionsColumn}>
                                <button
                                    className={styles.edit}
                                    onClick={() => handleEdit(item)}
                                    title="Editar producto"
                                >
                                    <Edit />
                                </button>
                                <button
                                    className={styles.delete}
                                    onClick={() => handleDelete(item.productId)}
                                    title="Eliminar producto"
                                >
                                    <Trash />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={config.columns.length + 1} className={styles.emptyTableMessage}>
                            No hay productos asignados a esta tienda
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
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        &lt;
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StoreProductTable;
'use client';

import styles from './datatable.module.css';
import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

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

type DataTableProps = {
    data: any[];
    config: TableConfig;
    className?: string;
}

const GenericDataTable = ({ data, config, className = "" }: DataTableProps) =>
{
    const pathname = usePathname();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = config.itemsPerPage || 10;
    const statusArr =  [
        "approved",
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

    const roleArr = [
        "admin",
        "manager",
        "user",
        "manufacturer",
        "courier"
    ];

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

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

    const getUrl = (id: string) =>
    {
        return `${pathname}/${id}`;
    }

    const renderRole = (role: string) =>
    {
        let roleClass: string;

        switch (role.toLowerCase())
        {
            case "admin":
                roleClass = styles.roleAdmin;
                break;
            case "manager":
                roleClass = styles.roleManager;
                break;
            case "user":
                roleClass = styles.roleUser;
                break;
            case "manufacturer":
                roleClass = styles.roleManufacturer;
                break;
            case "courier":
                roleClass = styles.roleCourier;
                break;
            default:
                roleClass = styles.roleDefault;
        }

        return <span className={roleClass}>{role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}</span>;
    }
    const renderType = (type: string) =>
    {
        let typeClass: string;
        let value: string;

        switch (type.toLowerCase())
        {
            case "supply_request":
                typeClass = styles.typeSupplyRequest;
                value = "Abastecimiento";
                break;
            case "return_request":
                typeClass = styles.typeReturn;
                value = "Devolución";
                break;
            case "relocation_request":
                typeClass = styles.typeRelocation;
                value = "Reubicación";
                break;
            default:
                typeClass = styles.typeDefault;
                value = 'Tipo Desconocido';
        }

        return <span className={typeClass}>{value}</span>;
    }

    // Renderizar badge de estado con color correspondiente
    const renderStatusBadge = (status: string) =>
    {
        let badgeClass: string;

        switch (status.toLowerCase())
        {
            case "approved":
                badgeClass = styles.statusCompleted;
                break;
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
            const date = new Date(dateString);
            const formattedDate = date.toLocaleString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'America/Bogota'
            });

            return <span className={styles.dateValue}>{formattedDate}</span>;
        }
        catch (error)
        {
            return dateString; // Sí hay error, mostrar valor original
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

        if (typeof value === 'string' && statusArr.includes(value.toLowerCase()))
        {
            return renderStatusBadge(value);
        }

        if (typeof value === 'string' && roleArr.includes(value.toLowerCase()))
        {
            return renderRole(value);
        }

        if (typeof value === 'string' && column.key.toLowerCase().includes('type'))
        {
            return renderType(value);
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
                            <tr key={rowIndex} onClick={() => router.push(getUrl(item.id))}>
                                {config.columns.map((column) => (
                                    <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                        {renderCellValue(column, getNestedValue(item, column.key), item)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={config.columns.length} className={styles.emptyTableMessage}>
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

export default GenericDataTable;
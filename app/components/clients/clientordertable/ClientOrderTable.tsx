'use client';

import styles from './datatable.module.css';
import { ReactNode, useState } from 'react';
import { Edit, Trash } from '@/app/components/svg';
import { usePathname, useRouter } from 'next/navigation';

export type Column = {
    key: string;
    header: string;
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

const ClientOrderTable = ({ data, config, className = "" }: DataTableProps) =>
{
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = config.itemsPerPage || 5;

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

    // Renderizar valor de celda basado en la configuración de columna
    const renderCellValue = (column: Column, value: any, row: any) =>
    {
        if (column.render)
        {
            return column.render(value, row);
        }

        return value;
    }

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
                            <tr key={rowIndex} onClick={() => router.push(getUrl(item.code))}>
                                {config.columns.map((column) => (
                                    <td key={`${rowIndex}-${column.key}`} style={column.width ? { width: column.width } : {}}>
                                        {renderCellValue(column, item[column.key], item)}
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

export default ClientOrderTable;
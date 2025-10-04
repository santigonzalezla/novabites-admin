"use client"

import { useState } from "react";
import styles from "./inventorytable.module.css";

export type Column = {
    key: string
    header: string
    render?: string
}

type DataTableProps = {
    data: any[]
    itemsPerPage?: number
}

const columns: Column[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "NAME" },
    { key: "address", header: "ADDRESS" },
    { key: "date", header: "DATE" },
    { key: "projects", header: "PROJECTS" },
    { key: "status", header: "STATUS"},
]

const InventoryTable = ({ data, itemsPerPage = 8 }: DataTableProps) =>
{
    const [currentPage, setCurrentPage] = useState(1)

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

    // Renderizar badge de estado con color correspondiente
    const renderStatusBadge = (status: string) =>
    {
        let badgeClass = "";

        switch (status.toLowerCase())
        {
            case "completed":
                badgeClass = styles.statusCompleted;
                break;
            case "processing":
                badgeClass = styles.statusProcessing;
                break;
            case "rejected":
                badgeClass = styles.statusRejected;
                break;
            case "on hold":
                badgeClass = styles.statusOnHold;
                break;
            default:
                badgeClass = styles.statusDefault;
        }

        return <span className={`${styles.statusBadge} ${badgeClass}`}>{status}</span>
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={`${index}-${column.key}`}>
                                    {column.render ? <span className={`${styles.statusBadge}`}>{column.render}</span>
                                        : item[column.key] == "Completed" || item[column.key] == "Processing" || item[column.key] == "Rejected" || item[column.key] == "On Hold"
                                            ? renderStatusBadge(item[column.key]) : item[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.pagination}>
        <span>
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} of {data.length}
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

export default InventoryTable;
"use client"

import { useEffect, useState } from 'react';
import styles from "./storeuser.module.css"
import { AddItem, Download, Search, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import SupplyProductTable from '@/app/components/supplies/supplyproducttable/SupplyProductTable';
import StoreUserTable from '@/app/components/stores/storeusertable/StoreUserTable';

interface StoreUser {
    id: string;
    name: string;
    role: string;
    status: string;
    phone: string;
}

interface SupplyProductConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}
const StoreUser = () =>
{
    const [supplyProductData, setSupplyProductData] = useState<StoreUser[]>([]);
    const [config, setConfig] = useState<SupplyProductConfig>({columns: []});

    useEffect(() =>
    {
        setSupplyProductData(mockData.storeuser.data as StoreUser[]);
        setConfig(mockData.storeuser.config);
    }, []);

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSupply, setSelectedSupply] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const filteredSupplies = supplyProductData.filter(
        (product) =>
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleAddSupply = () =>
    {
        console.log("")
    }

    return (
        <div className={styles.productsupply}>
            <div className={styles.header}>
                <div className={styles.addForm}>
                    <div className={styles.selectContainer}>
                        <div className={styles.customSelect}>
                            <div className={styles.selectInput}>
                                <input
                                    type="text"
                                    placeholder="Buscar Usuarios..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() =>
                                    {
                                        // Pequeño retraso para permitir la selección antes de cerrar
                                        setTimeout(() => setIsDropdownOpen(false), 200)
                                    }}
                                />
                                <Search />
                            </div>
                            {isDropdownOpen && (
                                <ul className={styles.dropdownList}>
                                    {filteredSupplies.length > 0 ? (
                                        filteredSupplies.map((supply) => (
                                            <li
                                                key={supply.id}
                                                onMouseDown={(e) =>
                                                {
                                                    e.preventDefault() // Previene que el onBlur cierre el dropdown antes de la selección
                                                    setSelectedSupply(supply.id)
                                                    setSearchTerm(supply.name)
                                                }}
                                            >
                                                <span className={styles.supplyId}>{supply.id}</span>
                                                <span className={styles.supplyName}>{supply.name}</span>
                                                <span className={styles.supplyUnit}>{supply.role}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className={styles.noResults}>No se encontraron insumos</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                    <button className={styles.confirmButton} onClick={handleAddSupply} disabled={!selectedSupply}>
                        <AddItem />
                    </button>
                </div>
                <div className={styles.productsupplyactions}>
                    <button className={styles.upload}><Upload /></button>
                    <button className={styles.download}><Download /></button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <StoreUserTable data={supplyProductData} config={config} />
            </div>
        </div>
    )
}

export default StoreUser;
"use client"

import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from "./productsupply.module.css"
import { AddItem, Download, Edit, Plus, Search, Upload } from '@/app/components/svg';
import ProductSupplyTable from '@/app/components/inventory/productsupplytable/ProductSupplyTable';
import mockData from '@/app/components/shared/data/mockData.json';
import { useFetch } from '@/hooks/useFetch';
import { ProductSupply as ProductSupplyData, Supply } from '@/interfaces/interfaces';
import { usePathname } from 'next/navigation';
import Modal from '@/app/components/shared/modal/Modal';
import ProductSupplyForm from '@/app/components/inventory/productsupplyform/ProductSupplyForm';
import { toast } from 'sonner';

interface ProductSupplyConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const ProductSupply = () =>
{
    const pathname = usePathname();
    const productId = pathname.split('/').pop();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupply, setEditingSupply] = useState<ProductSupplyData | null>(null);
    const [config, setConfig] = useState<ProductSupplyConfig>({columns: []});
    const [productSupplyData, setProductSupplyData] = useState<ProductSupplyData[]>([]);
    const { data, error, execute } = useFetch<ProductSupplyData[]>(`/api/product-supply/product/${productId}`);
    const { error: productSupplyError, execute: productSupplyExecute } = useFetch(`/api/product-supply`, {
        immediate: false,
    });
    const { data: supplyData, error: supplyError, execute: supplyExecute } = useFetch<Supply[]>(`/api/supply`);
    const [selectedSupplyData, setSelectedSupplyData] = useState<Supply | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() =>
    {
        if (error || supplyError)
        {
            toast.error(`Error al cargar los datos: ${error || supplyError}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }

        try
        {
            if (data)
            {
                setProductSupplyData(data);
            }
            setConfig(mockData.productsupply.config);
        }
        catch (error)
        {
            console.error("Error al cargar los datos de insumos del producto:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, [data]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSupply, setSelectedSupply] = useState("");
    const [amountUsed, setAmountUsed] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredSupplies = supplyData?.filter((supply) =>
    {
        const isAlreadyAdded = productSupplyData.some(
            (productSupply) => productSupply.supplyId === supply.id
        );

        const matchesSearch = searchTerm === '' ||
            supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supply.id.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch && !isAlreadyAdded;
    });

    const handleSupplySelect = (supply: Supply) =>
    {
        setSelectedSupply(supply.id);
        setSelectedSupplyData(supply);
        setSearchTerm(supply.name);
        setIsDropdownOpen(false);
    }

    const clearSelection = () =>
    {
        setSelectedSupply("");
        setSelectedSupplyData(null);
        setSearchTerm("");

        setTimeout(() =>
        {
            if (inputRef.current)
            {
                inputRef.current.focus();
                setIsDropdownOpen(true);
            }
        }, 0);
    }

    const handleAddSupply = async () =>
    {
        const newSupply = { productId: productId, supplyId: selectedSupply, amountUsed: amountUsed, }

        try
        {
            const newProductSupply = await productSupplyExecute({
                method: "POST",
                body: newSupply
            });

            if (newProductSupply && !productSupplyError)
            {
                setSelectedSupply("");
                setAmountUsed("");
                setSearchTerm("");
                setIsDropdownOpen(false);

                toast.success("Insumo agregado exitosamente!", {
                    description: "El insumo ha sido añadido al producto.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const productSupply = await execute();

                if (productSupply)
                {
                    setProductSupplyData(productSupply);
                }
            }
            else
            {
                console.error("Error al agregar el insumo");
                toast.error("Error al agregar el insumo", {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error("Error al agregar el insumo:", e);
            toast.error(`Error al agregar el insumo: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handlePatchSupply = async (supplyId: string, amountUsed: number) =>
    {
        const updatedSupply = { amountUsed: String(amountUsed) };

        try
        {
            const response = await productSupplyExecute({
                method: "PATCH",
                body: updatedSupply
            }, `/api/product-supply/${productId}/${supplyId}`);

            if (response && !productSupplyError)
            {
                const updatedProductSupply = await execute();

                toast.success('Insumo actualizado exitosamente!', {
                    description: "El insumo ha sido actualizado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                if (updatedProductSupply) setProductSupplyData(updatedProductSupply);
            }
            else
            {
                console.error("Error al actualizar el insumo");
            }
        }
        catch (error)
        {
            console.error("Error al actualizar el insumo:", error);
            toast.error(`Error al actualizar el insumo: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleDeleteSupply = async (supplyId: string) =>
    {
        try
        {
            const response = await productSupplyExecute({
                method: "DELETE",
            }, `/api/product-supply/${productId}/${supplyId}`);

            if (response && !productSupplyError)
            {
                const updatedProductSupply = await execute();

                toast.success('Insumo eliminado exitosamente!', {
                    description: "El insumo ha sido eliminado del producto.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                if (updatedProductSupply) setProductSupplyData(updatedProductSupply);
            }
            else
            {
                console.error("Error al eliminar el insumo");
            }
        }
        catch (error)
        {
            console.error("Error al eliminar el insumo:", error);
            toast.error(`Error al eliminar el insumo: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleOverlayClick = () => setIsModalOpen(false);

    const editProductSupply = (): ReactNode =>
    {
        return (
            <ProductSupplyForm
                productSupply={editingSupply}
                handlePatchSupply={handlePatchSupply}
                onClose={handleOverlayClick}
            />
        );
    }

    return (
        <div className={styles.productsupply}>
            {isModalOpen && (
                <Modal children={editProductSupply()} onClose={handleOverlayClick} />
            )}
            <div className={styles.header}>
                <div className={styles.addForm}>
                    <div className={styles.selectContainer}>
                        <div className={styles.customSelect}>
                            <div className={styles.selectInput}>
                                <input
                                    type="text"
                                    ref={inputRef}
                                    placeholder={selectedSupply ? "" : "Buscar insumos..."}
                                    value={selectedSupply ? "" : searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => !selectedSupply && setIsDropdownOpen(true)} // ✅ Solo abrir si no hay selección
                                    onBlur={() => {
                                        setTimeout(() => setIsDropdownOpen(false), 150);
                                    }}
                                    className={selectedSupply ? styles.hasSelection : ''}
                                    readOnly={!!selectedSupply}
                                />

                                {/* ✅ Pill que aparece cuando hay selección */}
                                {selectedSupply && selectedSupplyData && (
                                    <div className={styles.supplyPill}>
                                        <span className={styles.supplyPillText}>{selectedSupplyData.numId} - {selectedSupplyData.name}</span>
                                        <button
                                            type="button"
                                            className={styles.pillClearButton}
                                            onMouseDown={(e) => {e.preventDefault()}}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ Evitar propagación
                                                clearSelection();
                                            }}
                                            title="Eliminar selección"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <Search />
                            </div>

                            {/* ✅ Solo mostrar dropdown si no hay selección */}
                            {isDropdownOpen && !selectedSupply && (
                                <ul className={styles.dropdownList}>
                                    {filteredSupplies ? (
                                        filteredSupplies.map((supply) => (
                                            <li
                                                key={supply.id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSupplySelect(supply);
                                                }}
                                            >
                                                <span className={styles.supplyId}>{supply.numId}</span>
                                                <span className={styles.supplyName}>{supply.name}</span>
                                                <span className={styles.supplyUnit}>{supply.unit}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className={styles.noResults}>No se encontraron insumos</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className={styles.quantityInput}>
                        <input type="number" id="quantity" placeholder="Cuanta cantidad..." value={amountUsed} onChange={(e) => setAmountUsed(e.target.value)} min="1" />
                    </div>
                    <button className={styles.confirmButton} onClick={handleAddSupply} disabled={!selectedSupply || !amountUsed}>
                        <AddItem />
                    </button>
                </div>
                <div className={styles.productsupplyactions}>
                    <button className={styles.upload}><Upload /></button>
                    <button className={styles.download}><Download /></button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <ProductSupplyTable
                    data={productSupplyData}
                    setIsModalOpen={setIsModalOpen}
                    setEditingSupply={setEditingSupply}
                    config={config}
                    handleDeleteSupply={handleDeleteSupply}
                />
            </div>
        </div>
    )
}

export default ProductSupply;
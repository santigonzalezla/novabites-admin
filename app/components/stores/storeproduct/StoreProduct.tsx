"use client"

import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from "./storeproduct.module.css"
import { AddItem, Download, Search, Upload } from '@/app/components/svg';
import mockData from '@/app/components/shared/data/mockData.json';
import { useFetch } from '@/hooks/useFetch';
import { Product, StoreProduct as StoreProductData } from '@/interfaces/interfaces';
import { usePathname } from 'next/navigation';
import Modal from '@/app/components/shared/modal/Modal';
import StoreProductForm from '@/app/components/stores/storeproductform/StoreProductForm';
import { toast } from 'sonner';
import StoreProductTable from '@/app/components/stores/storeproducttable/StoreProductTable';

interface StoreProductConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

const StoreProduct = () =>
{
    const pathname = usePathname();
    const storeId = pathname.split('/').pop();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStoreProduct, setEditingStoreProduct] = useState<StoreProductData | null>(null);
    const [config, setConfig] = useState<StoreProductConfig>({columns: []});
    const [storeProductData, setStoreProductData] = useState<StoreProductData[]>([]);
    const { data, error, execute } = useFetch<StoreProductData[]>(`/api/store-product/store/${storeId}`);
    const { error: storeProductError, execute: storeProductExecute } = useFetch(`/api/store-product`, {
        immediate: false,
    });
    const { data: productData, error: productError } = useFetch<Product[]>(`/api/product`);
    const [selectedProductData, setSelectedProductData] = useState<Product | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() =>
    {
        if (error || productError)
        {
            toast.error(`Error al cargar los datos: ${error || productError}`, {
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
                setStoreProductData(data);
            }
            setConfig(mockData.storeProductTable.config);
        }
        catch (error)
        {
            console.error("Error al cargar los productos de la tienda:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, [data, error, productError]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [allocatedStock, setAllocatedStock] = useState("");
    const [minStock, setMinStock] = useState("");
    const [price, setPrice] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filtrar productos que no están ya agregados a la tienda
    const filteredProducts = productData?.filter((product) =>
    {
        const isAlreadyAdded = storeProductData.some(
            (storeProduct) => storeProduct.productId === product.id
        );

        const matchesSearch = searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.numId.toString().includes(searchTerm);

        return matchesSearch && !isAlreadyAdded;
    });

    const handleProductSelect = (product: Product) =>
    {
        setSelectedProduct(product.id);
        setSelectedProductData(product);
        setSearchTerm(product.name);
        setPrice(String(product.basePrice));
        setIsDropdownOpen(false);
    }

    const clearSelection = () =>
    {
        setSelectedProduct("");
        setSelectedProductData(null);
        setSearchTerm("");
        setPrice("");

        setTimeout(() =>
        {
            if (inputRef.current)
            {
                inputRef.current.focus();
                setIsDropdownOpen(true);
            }
        }, 0);
    }

    const handleAddStoreProduct = async () =>
    {
        if (!allocatedStock || !minStock || !price)
        {
            toast.error("Campos incompletos", {
                description: "Por favor completa todos los campos requeridos.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        const newStoreProduct = {
            storeId: storeId,
            productId: selectedProduct,
            allocatedStock: Number(allocatedStock),
            currentStock: Number(allocatedStock),
            minStock: Number(minStock),
            price: price,
            lastAllocation: new Date().toISOString(),
            available: true
        }

        try
        {
            const createdStoreProduct = await storeProductExecute({
                method: "POST",
                body: newStoreProduct
            });

            if (createdStoreProduct && !storeProductError)
            {
                setSelectedProduct("");
                setAllocatedStock("");
                setMinStock("");
                setPrice("");
                setSearchTerm("");
                setIsDropdownOpen(false);

                toast.success("Producto agregado exitosamente!", {
                    description: "El producto ha sido añadido a la tienda.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const updatedStoreProducts = await execute();

                if (updatedStoreProducts)
                {
                    setStoreProductData(updatedStoreProducts);
                }
            }
            else
            {
                console.error("Error al agregar el producto");
                toast.error("Error al agregar el producto", {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error("Error al agregar el producto:", e);
            toast.error(`Error al agregar el producto: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handlePatchStoreProduct = async (storeProductId: string, productId: string, updatedData: Partial<StoreProductData>) =>
    {
        try
        {
            const response = await storeProductExecute({
                method: "PATCH",
                body: updatedData
            }, `/api/store-product/${storeId}/${productId}`);

            if (response && !storeProductError)
            {
                const updatedStoreProducts = await execute();

                toast.success('Producto actualizado exitosamente!', {
                    description: "El producto ha sido actualizado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                if (updatedStoreProducts) setStoreProductData(updatedStoreProducts);
            }
            else
            {
                console.error("Error al actualizar el producto");
            }
        }
        catch (error)
        {
            console.error("Error al actualizar el producto:", error);
            toast.error(`Error al actualizar el producto: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleDeleteStoreProduct = async (storeProductId: string) =>
    {
        try
        {
            console.log(storeId);

            const response = await storeProductExecute({
                method: "DELETE",
            }, `/api/store-product/${storeId}/${storeProductId}`);

            if (response && !storeProductError)
            {
                const updatedStoreProducts = await execute();

                toast.success('Producto eliminado exitosamente!', {
                    description: "El producto ha sido eliminado de la tienda.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                if (updatedStoreProducts) setStoreProductData(updatedStoreProducts);
            }
            else
            {
                console.error("Error al eliminar el producto");
            }
        }
        catch (error)
        {
            console.error("Error al eliminar el producto:", error);
            toast.error(`Error al eliminar el producto: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleOverlayClick = () => setIsModalOpen(false);

    const editStoreProduct = (): ReactNode =>
    {
        return (
            <StoreProductForm
                storeProduct={editingStoreProduct}
                handlePatchStoreProduct={handlePatchStoreProduct}
                onClose={handleOverlayClick}
            />
        );
    }

    return (
        <div className={styles.productsupply}>
            {isModalOpen && (
                <Modal children={editStoreProduct()} onClose={handleOverlayClick} />
            )}
            <div className={styles.header}>
                <div className={styles.addForm}>
                    <div className={styles.selectContainer}>
                        <div className={styles.customSelect}>
                            <div className={styles.selectInput}>
                                <input
                                    type="text"
                                    ref={inputRef}
                                    placeholder={selectedProduct ? "" : "Buscar productos..."}
                                    value={selectedProduct ? "" : searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => !selectedProduct && setIsDropdownOpen(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsDropdownOpen(false), 150);
                                    }}
                                    className={selectedProduct ? styles.hasSelection : ''}
                                    readOnly={!!selectedProduct}
                                />

                                {selectedProduct && selectedProductData && (
                                    <div className={styles.supplyPill}>
                                        <span className={styles.supplyPillText}>
                                            {selectedProductData.numId} - {selectedProductData.name}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.pillClearButton}
                                            onMouseDown={(e) => {e.preventDefault()}}
                                            onClick={(e) => {
                                                e.stopPropagation();
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

                            {isDropdownOpen && !selectedProduct && (
                                <ul className={styles.dropdownList}>
                                    {filteredProducts && filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <li
                                                key={product.id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleProductSelect(product);
                                                }}
                                            >
                                                <span className={styles.supplyId}>{product.numId}</span>
                                                <span className={styles.supplyName}>{product.name}</span>
                                                <span className={styles.supplyUnit}>${product.basePrice}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className={styles.noResults}>No se encontraron productos</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className={styles.quantityInput}>
                        <input
                            type="number"
                            placeholder="Stock asignado..."
                            value={allocatedStock}
                            onChange={(e) => setAllocatedStock(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className={styles.quantityInput}>
                        <input
                            type="number"
                            placeholder="Stock mínimo..."
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className={styles.quantityInput}>
                        <input
                            type="number"
                            placeholder="Precio..."
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <button
                        className={styles.confirmButton}
                        onClick={handleAddStoreProduct}
                        disabled={!selectedProduct || !allocatedStock || !minStock || !price}
                    >
                        <AddItem />
                    </button>
                </div>
                <div className={styles.productsupplyactions}>
                    <button className={styles.upload}><Upload /></button>
                    <button className={styles.download}><Download /></button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <StoreProductTable
                    data={storeProductData}
                    setIsModalOpen={setIsModalOpen}
                    setEditingStoreProduct={setEditingStoreProduct}
                    config={config}
                    handleDeleteStoreProduct={handleDeleteStoreProduct}
                />
            </div>
        </div>
    )
}

export default StoreProduct;
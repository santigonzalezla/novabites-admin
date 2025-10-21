'use client';

import styles from './productcontent.module.css';
import Image from 'next/image';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryProduct, Product, Store, StoreProduct, SubcategoryProduct, Supplier } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import ProductStoreTable from '@/app/components/inventory/productstoretable/ProductStoreTable';
import mockData from '@/app/components/shared/data/mockData.json';

interface ProductContentProps {
    setData: (id: string, name: string) => void;
}

const ProductContent = ({ setData }: ProductContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<Product>();
    const [defaultData, setDefaultData] = useState<Product>()
    const productId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<Product>>();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { error, execute } = useFetch<Product>(`/api/product/${productId}`);
    const { data: supplierData, error: supplierError } = useFetch<Supplier>(`/api/supplier`);
    const { data: categoryData, error: categoryError } = useFetch<CategoryProduct>(`/api/category-product`);
    const { data: subcategoryData, error: subcategoryError } = useFetch<SubcategoryProduct>(`/api/subcategory-product`);
    const { data: storeProductData, error: storeProductError } = useFetch<StoreProduct[]>(`/api/store-product/product/${productId}`);

    useEffect(() =>
    {
        if (error || supplierError || categoryError || storeProductError)
        {
            console.error('Error al cargar los datos:', error || supplierError || categoryError || storeProductError);
            toast.error(`Error al cargar los datos: ${error || supplierError || categoryError || storeProductError}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }
        try
        {
            const fetchData = async () =>
            {
                const product = await execute();

                if (product)
                {
                    setData(String(product.numId), product.name);
                    setFormData(product);
                    setDefaultData(product);
                    setModifiedFields({});
                }
            }

            fetchData();
        }
        catch (err)
        {
            console.error('Error al establecer los datos del producto:', err);
        }
    }, []);

    const filteredSubcategories = useMemo(() =>
    {
        if (!subcategoryData) return [];

        const subcategoriesArray = Object.values(subcategoryData);

        if (!formData?.category?.id) return subcategoriesArray;

        return subcategoriesArray.filter((subcategory: SubcategoryProduct) => subcategory.categoryId === formData.category?.id);

    }, [subcategoryData, formData?.category?.id]);

    const handleDisable = async () =>
    {
        setIsDisabled(!isDisabled);

        if (!isDisabled)
        {
            if (defaultData) setFormData(defaultData);

            setModifiedFields({});
            setSelectedImage(null);
            setPreviewImage(null);
        }
        else
        {
            if (formData)
            {
                const newFetch = await execute();

                if (newFetch)
                {
                    setFormData(newFetch);
                    setDefaultData(newFetch);
                }
            }
        }
    }

    const handleImageClick = () =>
    {
        if (!isDisabled && fileInputRef.current) fileInputRef.current.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        if (file)
        {
            if (!file.type.startsWith('image/'))
            {
                toast.error("Por favor selecciona un archivo de imagen válido", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024)
            {
                toast.error("La imagen debe ser menor a 5MB", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            setSelectedImage(file);
            setModifiedFields((prev) => ({ ...prev, imageFile: true }));

            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target?.result as string);
            reader.readAsDataURL(file);

            toast.success("Imagen seleccionada correctamente", {
                description: "La imagen se actualizará cuando guardes los cambios",
                duration: 2000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({ ...formData, [name]: value });

        if (defaultData)
        {
            if (isValueChanged(value, name))
            {
                setModifiedFields((prev) => ({
                    ...prev,
                    [name]: value
                }));
            }
            else
            {
                setModifiedFields(prev =>
                {
                    const { [name]: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const supplierId = e.target.value;
        const selectedSupplier = supplierData && Object.values(supplierData).find((supplier: any) => supplier.id === supplierId);

        if (formData && selectedSupplier)
        {
            const updatedFormData = {
                ...formData,
                supplier: selectedSupplier,
                supplierId: supplierId
            };
            setFormData(updatedFormData);
        }

        if (defaultData)
        {
            if (defaultData.supplier?.id !== supplierId)
            {
                setModifiedFields((prev) => ({ ...prev, supplierId: supplierId }));
            }
            else
            {
                setModifiedFields(prev => {
                    const { supplierId: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const categoryId = e.target.value;
        const selectedCategory = categoryData && Object.values(categoryData).find((category: any) => category.id === categoryId);

        if (formData && selectedCategory)
        {
            const updatedFormData = {
                ...formData,
                category: selectedCategory,
                categoryId: categoryId,
                subcategory: undefined,
                subcategoryId: undefined
            };
            setFormData(updatedFormData);
        }

        if (defaultData)
        {
            if (defaultData.category?.id !== categoryId)
            {
                setModifiedFields((prev) => ({ ...prev, categoryId: categoryId }));
            }
            else
            {
                setModifiedFields(prev => {
                    const { categoryId: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const subcategoryId = e.target.value;
        const selectedSubcategory = subcategoryData && Object.values(subcategoryData).find((subcategory: any) => subcategory.id === subcategoryId);

        if (formData && selectedSubcategory)
        {
            const updatedFormData = {
                ...formData,
                subcategory: selectedSubcategory,
                subcategoryId: subcategoryId
            };
            setFormData(updatedFormData);
        }

        if (defaultData)
        {
            if (defaultData.subcategory?.id !== subcategoryId)
            {
                setModifiedFields((prev) => ({ ...prev, subcategoryId: subcategoryId }));
            }
            else
            {
                setModifiedFields(prev => {
                    const { subcategoryId: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const isValueChanged = (newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof Product] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            const hasFieldChanges = modifiedFields && Object.keys(modifiedFields).length > 0;
            const hasImageChange = selectedImage !== null;

            if (hasFieldChanges || hasImageChange)
            {
                const formDataToSend = new FormData();

                if (modifiedFields)
                {
                    Object.keys(modifiedFields).forEach(key =>
                    {
                        if (key !== 'imageFile')
                        {
                            const value = modifiedFields[key as keyof Product];
                            if (value !== undefined && value !== null) formDataToSend.append(key, String(value));
                        }
                    });
                }

                if (selectedImage) formDataToSend.append('image', selectedImage);

                console.log(formDataToSend);

                const updatedProduct = await execute({
                    method: 'PATCH',
                    body: formDataToSend,
                    isFormData: true
                });

                if (updatedProduct && !error)
                {
                    setIsDisabled(true);

                    toast.success("Product actualizado correctamente", {
                        description: "El producto ha sido actualizada con éxito.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });

                    const updatedData = updatedProduct;
                    setFormData(updatedData);
                    setDefaultData(updatedData);
                    setData(String(updatedData.numId), updatedData.name);
                    setModifiedFields({});
                    setSelectedImage(null);
                    setPreviewImage(null);
                }
                else
                {
                    toast.error("Error al actualizar la tienda", {
                        description: "Por favor, inténtalo de nuevo más tarde.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                }
            }
            else
            {
                console.log('No hay cambios para guardar');
            }
        }
        catch (e)
        {
            console.error("Error al guardar los cambios:", e);
            toast.error(`Error al guardar los cambios: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    return (
        <div className={styles.productcontent}>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <form className={styles.containerLeftSection}>
                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles del Producto</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Product name"
                                        value={formData?.name || ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Precio:</span>
                                    <input
                                        type="text"
                                        name="basePrice"
                                        id="basePrice"
                                        placeholder="Precio Base"
                                        value={`${formData?.basePrice}`|| ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Categoría:</span>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                        disabled={isDisabled}
                                        value={formData?.category?.id || ''}
                                        onChange={handleCategoryChange}
                                    >
                                        {categoryData && Object.values(categoryData).map((category: CategoryProduct) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.detailLabel}>
                                    <span>Subcategoría:</span>
                                    <select
                                        id="subcategoryId"
                                        name="subcategoryId"
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                        disabled={isDisabled}
                                        value={formData?.subcategory?.id || ''}
                                        onChange={handleSubcategoryChange}
                                    >
                                        <option value="" disabled>Selecciona una categoría</option>
                                        {filteredSubcategories.map((subcategory: SubcategoryProduct) => (
                                            <option key={subcategory.id} value={subcategory.id}>
                                                {subcategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <h2 className={styles.sectionTitle}>Detalles del Proveedor</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailLabel}>
                                    <span>ID Proveedor:</span>
                                    <select
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                        disabled={isDisabled}
                                        value={formData?.supplier?.id || ''}
                                        onChange={handleSupplierChange}
                                        name="supplierId"
                                        id="supplierId"
                                    >
                                        <option value="" disabled>Seleccionar Proveedor</option>
                                        {supplierData && Object.values(supplierData).map((supplier: Supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.numId}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                <div className={styles.detailLabel}>
                                    <span>Nombre:</span>
                                    <input
                                        type="text"
                                        value={formData?.supplier?.name || ''}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>

                                <div className={styles.detailLabel}>
                                    <span>Teléfono:</span>
                                    <input
                                        type="text"
                                        value={formData?.supplier?.phone || ''}
                                        disabled
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className={styles.tableSection}>
                        <h2 className={styles.sectionTitle}>Tiendas y Stock</h2>
                        <ProductStoreTable
                            data={storeProductData || []}
                            config={mockData.storeProduct.config}
                        />
                    </div>
                </div>

                <div className={styles.sideContent}>
                    <div>
                        {isDisabled ? (
                            <button className={styles.editButton} onClick={() => handleDisable()}>
                                <Edit />
                                Editar Campos
                            </button>
                        ) : (
                            <div className={styles.actionButtons}>
                                <button className={styles.cancelButton} onClick={() => handleDisable()}>Cancelar</button>
                                <button className={styles.saveButton} onClick={() => handleSaveChanges()}>Guardar</button>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div
                        className={`${styles.productImage} ${!isDisabled ? styles.productImageSelector : ''}`}
                        onClick={handleImageClick}
                        style={{ cursor: !isDisabled ? 'pointer' : 'default' }}
                    >
                        <Image
                            src={previewImage || formData?.imageUrl || '/placeholder.jpg'}
                            alt="Product Image"
                            width={150}
                            height={200}
                            className={`${styles.image} ${!isDisabled ? styles.imageDisabled : ''}`}
                        />
                        {!isDisabled && (
                            <div className={styles.imageOverlay}>
                                <span>Click para cambiar imagen</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.stockSummary}>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Stock Actual</div>
                            <div className={styles.stockNumber}>
                                <input
                                    type="number"
                                    name="centralStock"
                                    id="centralStock"
                                    placeholder="Stock Actual"
                                    value={`${formData?.centralStock}`|| ''}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={isDisabled ? styles.disabled : styles.detailValue}
                                />
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Stock Mínimo</div>
                            <div className={styles.stockNumber}>
                                <div className={styles.stockNumber}>
                                    <input
                                        type="number"
                                        name="minStock"
                                        id="minStock"
                                        placeholder="Stock Min"
                                        value={`${formData?.minStock}`|| ''}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                        className={isDisabled ? styles.disabled : styles.detailValue}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.stockItem}>
                            <div className={styles.stockLabel}>Estado</div>
                            <div className={styles.stockNumber}>Low Stock</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductContent;
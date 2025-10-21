'use client';

import styles from './categorycontent.module.css';
import { Edit } from '@/app/components/svg';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryProduct, Product, SubcategoryProduct } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import mockData from '@/app/components/shared/data/mockData.json';
import CategoryProductTable from '@/app/components/categories/categoryproducttable/CategoryProductTable';

interface CategoryContentProps {
    setData: (name: string) => void;
}

const SubcategoryContent = ({ setData }: CategoryContentProps) =>
{
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(true);
    const [formData, setFormData] = useState<SubcategoryProduct>();
    const [defaultData, setDefaultData] = useState<SubcategoryProduct>();
    const [categoryProducts, setCategoryProducts] = useState<Partial<Product>[]>([]);
    const categoryId = pathname.split('/').pop();
    const [modifiedFields, setModifiedFields] = useState<Partial<SubcategoryProduct>>();
    const { data, error, execute } = useFetch<SubcategoryProduct>(`/api/subcategory-product/${categoryId}`);
    const { data: categoryData, error: categoryError } = useFetch<CategoryProduct>(`/api/category-product`);
    const { data: patchData, error: patchError, execute: patchExecute } = useFetch<SubcategoryProduct>(`/api/subcategory-product/${categoryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        immediate: false
    });

    useEffect(() =>
    {
        if (error)
        {
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }

        try
        {
            const fetchCategory = async () =>
            {
                const category = await execute();

                if (category)
                {
                    setData(category.name);
                    setFormData(category);
                    setDefaultData(category);
                    setModifiedFields({});

                    (category.products && category._count) && setCategoryProducts([...category.products].sort((a, b) => a.numId - b.numId));
                }
            }

            fetchCategory();
        }
        catch (error)
        {
            console.error('Error al procesar los datos de la categoría:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const handleDisable = async () =>
    {
        setIsDisabled(!isDisabled);

        if (!isDisabled)
        {
            if (defaultData) setFormData(defaultData);

            setModifiedFields({});
        }
        else
        {
            if (data)
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

    const handleChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (formData) setFormData({
            ...formData, [name]: value
        });

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

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        const categoryId = e.target.value;
        const selectedCategory = categoryData && Object.values(categoryData).find((category: any) => category.id === categoryId);

        if (formData && selectedCategory)
        {
            const updatedFormData = {
                ...formData,
                category: selectedCategory,
                categoryId: categoryId
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

    const isValueChanged = (newValue: any, fieldPath: string) =>
    {
        if (!defaultData) return false;

        return defaultData[fieldPath as keyof CategoryProduct] !== newValue;
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            if (modifiedFields)
            {
                await patchExecute({ body: modifiedFields });

                setIsDisabled(!isDisabled);

                if (!patchError)
                {
                    toast.success('Categoría actualizada exitosamente!', {
                        description: "La categoría ha sido actualizado correctamente.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    setDefaultData(formData);
                    setModifiedFields({});
                }
            }
            else
            {
                console.log('No hay cambios para guardar');
            }
        }
        catch (error)
        {
            console.error('Error al guardar los cambios:', error);
            toast.error(`Error al guardar los cambios: ${error}`, {
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
                    <div className={styles.containerLeftSection}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailsSection}>
                                <h2 className={styles.sectionTitle}>Detalles de la Categoría</h2>
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailLabel}>
                                        <span>Nombre:</span>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Subcategory name"
                                            value={formData?.name || ''}
                                            onChange={handleChange}
                                            disabled={isDisabled}
                                            className={isDisabled ? styles.disabled : styles.detailValue}
                                        />
                                    </div>
                                </div>
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
                        </div>
                        <div className={styles.tableSection}>
                            <h2 className={styles.sectionTitle}>Productos Relacionados</h2>
                            <CategoryProductTable
                                data={categoryProducts || []}
                                config={mockData.categoryProduct.config}
                            />
                        </div>
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
                                <button className={styles.saveButton} onClick={() => handleSaveChanges()}>Guardar Cambios</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubcategoryContent;
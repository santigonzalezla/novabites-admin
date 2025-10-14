'use client';

import styles from './page.module.css';
import GenericDataTable from "@/app/components/shared/genericdatatable/GenericDataTable";
import { ReactNode, useEffect, useState } from 'react';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create } from '@/app/components/svg';
import GenericFilter, { FilterConfig, filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import Modal from '@/app/components/shared/modal/Modal';
import { CategoryProduct } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';

interface CategoryConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

interface InputConfig {
    fieldTypes: Record<string, string>;
    selectOptions?: Record<string, string[]>;
    labelTranslations: Record<string, string>;
    placeholderTranslations: Record<string, string>;
}

const Categories = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [categoriesData, setCategoriesData] = useState<CategoryProduct[]>([]);
    const [filteredData, setFilteredData] = useState<CategoryProduct[]>([]);
    const [config, setConfig] = useState<CategoryConfig>({columns: []});
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoading, error, execute } = useFetch<CategoryProduct[]>('/api/category-product', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/category-product/export', {
        immediate: false
    });

    const filterConfig: FilterConfig[] = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' }
    ];

    useEffect(() =>
    {
        if (error)
        {
            console.error('Error al cargar los datos de proveedores:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
            return;
        }

        try
        {
            const fetchCategories = async () =>
            {
                const categories = await execute();

                if (categories)
                {
                    setCategoriesData(categories);
                    const filtered = filterItems(categories, currentFilters);
                    setFilteredData(filtered);
                }
            }

            fetchCategories();
            setConfig(mockData.categories.config);
            setInputConfig(mockData.categories.inputConfig);
        }
        catch (error)
        {
            console.error('Error al cargar los datos de proveedores:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        const filtered = filterItems(categoriesData, filters);
        setFilteredData(filtered);
    };


    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(categoriesData);
    };

    const handleOverlayClick = () =>
    {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData: Record<string, any>) =>
    {
        const categoryData = { ...formData };

        try
        {
            const newCategory = await execute({
                method: 'POST',
                body: categoryData
            });

            if (newCategory && !error)
            {
                setIsModalOpen(false);

                toast.success('Proveedor creado correctamente!', {
                    description: "El proveedor ha sido añadido exitosamente.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const categories = await execute();

                if (categories)
                {
                    setCategoriesData(categories);
                    setFilteredData(categories);
                }
            }
            else if (error)
            {
                const errorMessage = error.toString().includes('Unique constraint') ? 'El nombre de la categoría ya existe.' : error;
                console.error('Error al crear el proveedor:', errorMessage);
                toast.error(`Error al crear el proveedor: ${errorMessage}`, {
                    description: "Por favor, inténtalo de nuevo más tarde.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error('Error al crear el proveedor:', e);
            toast.error(`Error al crear el proveedor: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const columns = [
        { key: 'name'}
    ];

    const createCategory = (): ReactNode =>
    {
        return (
            <GenericForm
                hasImage={false}
                type={"Categoría"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.categories}>
            <div className={styles.categoriesTop}>
                <GenericFilter
                    filterConfig={filterConfig}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                />
                <div className={styles.topButtons}>
                    <button className={styles.create} onClick={() => setIsModalOpen(prevState => !prevState)}>
                        <Create />
                    </button>
                    <DownloadButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="category-product"
                    />
                </div>
            </div>
            <GenericDataTable
                data={filteredData}
                config={config}
            />
            {isModalOpen && (
                <Modal children={createCategory()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default Categories;
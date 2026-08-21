'use client';

import styles from './page.module.css';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import { ReactNode, useEffect, useState } from 'react';
import GenericFilter from '@/app/components/shared/genericfilter/GenericFilter';
import GenericDataTable from '@/app/components/shared/genericdatatable/GenericDataTable';
import Modal from '@/app/components/shared/modal/Modal';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import { CategoryProduct, PaginatedResponse, Product } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { LoadErrorModal } from '@/app/components/shared/loaderrormodal/LoadErrorModal';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';

interface InventoryConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

interface InputConfig {
    fieldTypes: Record<string, string>;
    selectOptions: Record<string, string[] | { value: string; label: string; }[]>;
    labelTranslations: Record<string, string>;
    placeholderTranslations: Record<string, string>;
}

const FILTER_TO_QUERY_PARAM: Record<string, string> = {
    name: 'name',
    'category.name': 'categoryName',
    available: 'available',
};

const buildQueryString = (page: number, limit: number, filters: Record<string, string>) =>
{
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    Object.entries(filters).forEach(([field, value]) =>
    {
        const paramName = FILTER_TO_QUERY_PARAM[field];
        if (paramName && value && value.trim() !== '') params.set(paramName, value.trim());
    });

    return params.toString();
};

const Inventory = () =>
{
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [response, setResponse] = useState<PaginatedResponse<Product> | null>(null);
    const [config] = useState<InventoryConfig>(mockData.inventory.config);
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [page, setPage] = useState(1);
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const { isLoading, error, execute } = useFetch<PaginatedResponse<Product> | Product>('/api/product', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/product/upload', {
        immediate: false
    });
    const { execute: executeCategories } = useFetch<CategoryProduct[]>('/api/category-product', {
        immediate: false
    });

    const filterConfig = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'category.name', placeholder: 'Categoría', label: 'categoría' },
        { field: 'available', placeholder: 'Estado', label: 'estado' }
    ];

    const limit = config.itemsPerPage || 10;

    const fetchProducts = async () =>
    {
        const qs = buildQueryString(page, limit, currentFilters);
        const result = await execute({}, `/api/product?${qs}`) as PaginatedResponse<Product> | null;

        if (result) setResponse(result);

        return result;
    };

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
    }, [error]);

    useEffect(() =>
    {
        const fetchCategories = async () =>
        {
            const categoriesData = await executeCategories();

            if (categoriesData)
            {
                const baseConfig = mockData.inventory.inputConfig;
                const categoryOptions = categoriesData.map((category) => ({
                    value: category.id,
                    label: category.name
                }));

                setInputConfig({
                    ...baseConfig,
                    selectOptions: {
                        ...baseConfig.selectOptions,
                        'categoryId': categoryOptions
                    }
                });
            }
        }

        fetchCategories();
    }, []);

    useEffect(() =>
    {
        fetchProducts();
    }, [page, currentFilters, limit]);

    const handleFilterChange = (filters: Record<string, string>) =>
    {
        setCurrentFilters(filters);
        setPage(1);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setPage(1);
    };

    const handleOverlayClick = () =>
    {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData: any, file?: File | null) =>
    {
        const formDataToSend = new FormData();

        formDataToSend.append('name', formData.productName);
        formDataToSend.append('basePrice', formData.basePrice);
        formDataToSend.append('available', formData.available === 'ACTIVE' ? 'true' : 'false');

        if (formData?.centralStock) formDataToSend.append('centralStock', formData.centralStock);
        if (formData?.minStock) formDataToSend.append('minStock', formData.minStock)
        if (formData?.unit) formDataToSend.append('unit', formData.unit);
        if (formData?.expiryDate) formDataToSend.append('expiryDate', formData.expiryDate || '');
        if (formData?.categoryId) formDataToSend.append('categoryId', formData.categoryId);

        if (file) formDataToSend.append('image', file);

        try
        {
            const newProduct = await execute({
                method: 'POST',
                body: formDataToSend,
                isFormData: true
            });

            if (newProduct && !error)
            {
                setIsModalOpen(false);

                toast.success("Producto creado exitosamente!", {
                    description: "El producto ha sido añadido al inventario.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                await fetchProducts();
            }
        }
        catch (e)
        {
            console.error("Error al crear el producto:", e);
            toast.error(`Error al crear el producto: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        try
        {
            if (file)
            {
                const validExtensions = ['.xlsx', '.xls', '.csv'];
                const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

                if (!validExtensions.includes(fileExtension))
                {
                    toast.error('Formato de archivo inválido', {
                        description: 'Solo se permiten archivos .xlsx, .xls o .csv',
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    return;
                }

                if (file.size > 5 * 1024 * 1024)
                {
                    toast.error('Archivo muy grande', {
                        description: 'El archivo no debe superar los 5MB',
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });
                    return;
                }

                setUploadFile(file);
                await handleFileUpload(file);
            }
        }
        catch (e)
        {
            console.error('Error al subir el archivo:', `aqui ${e}`);
            toast.error(`Error al procesar el archivo`, {
                description: e instanceof Error ? `El archivo no cuenta con la estructura correcta del inventario. ${e.message}` : 'Error desconocido',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleFileUpload = async (file: File) =>
    {
        setIsUploading(true);

        try
        {
            const formData = new FormData();
            formData.append('file', file);

            const result = await executeFile({
                method: 'POST',
                body: formData,
                isFormData: true
            }, '/api/product/upload');

            if (!result)
            {
                throw new Error();
            }

            if (result)
            {
                toast.success(`Archivo procesado correctamente`, {
                    description: `${result.created} productos creados, ${result.failed} errores`,
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                if (result.errors.length > 0)
                {
                    console.log('Errores en el procesamiento:', result.errors);
                    setUploadResult(result);
                    setIsErrorModalOpen(true);
                }

                await fetchProducts();
            }
        }
        catch (e)
        {
            console.error('Error al subir el archivo:', e);
            toast.error(`Error al procesar el archivo`, {
                description: e instanceof Error
                    ? `El archivo no cuenta con la estructura correcta del inventario. ${e.message.split('Error code')[0]}`
                    : 'Error desconocido',
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsUploading(false);
            setUploadFile(null);
        }
    };

    const columns = [
        { key: 'productName'},
        { key: 'categoryId'},
        { key: 'centralStock'},
        { key: 'basePrice'},
        { key: 'expiryDate'},
        { key: 'available'}
    ];

    const createProduct = (): ReactNode =>
    {
        return (
            <GenericForm
                hasImage={true}
                type={"Producto"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.inventory}>
            {uploadResult && (
                <LoadErrorModal
                    isOpen={isErrorModalOpen}
                    onClose={() => setIsErrorModalOpen(false)}
                    uploadResult={uploadResult}
                />
            )}
            <div className={styles.inventoryTop}>
                <GenericFilter
                    filterConfig={filterConfig}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                />
                <div className={styles.topButtons}>
                    <button className={styles.create} onClick={() => setIsModalOpen(prevState => !prevState)}>
                        <Create />
                    </button>
                    <button
                        className={styles.upload}
                        onClick={() => document.getElementById('file-input')?.click()}
                        disabled={isUploading}
                    >
                        <Upload />
                    </button>
                    <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <DownloadButton
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        executeFile={executeFile}
                        domain="product"
                    />
                </div>
            </div>
            <GenericDataTable
                data={response?.data ?? []}
                config={config}
                pagination={{
                    page,
                    limit,
                    totalItems: response?.meta.total ?? 0,
                    totalPages: response?.meta.totalPages ?? 1,
                    onPageChange: setPage,
                }}
            />
            {isModalOpen && (
                <Modal children={createProduct()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default withAuth(Inventory, { allowedRoles: [Role.ADMIN, Role.MANAGER] });

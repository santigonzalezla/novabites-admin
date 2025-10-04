'use client';

import styles from './page.module.css';
import GenericDataTable from "@/app/components/shared/genericdatatable/GenericDataTable";
import { ReactNode, useEffect, useState } from 'react';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import GenericFilter, { FilterConfig, filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import Modal from '@/app/components/shared/modal/Modal';
import { Supplier, Supply } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { LoadErrorModal } from '@/app/components/shared/loaderrormodal/LoadErrorModal';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';

interface SupplyConfig {
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

const Supplies = () =>
{
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [suppliesData, setSuppliesData] = useState<Supply[]>([]);
    const [filteredData, setFilteredData] = useState<Supply[]>([]);
    const [config, setConfig] = useState<SupplyConfig>({columns: []});
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const { isLoading, error, execute } = useFetch<Supply[]>('/api/supply', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/supply/upload', {
        immediate: false
    });
    const { execute: executeSupplier } = useFetch<Supplier[]>('/api/supplier', {
        immediate: false
    });

    // Configuración de filtros
    const filterConfig: FilterConfig[] = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'supplier.name', placeholder: 'Proveedor', label: 'proveedor' },
        { field: 'available', placeholder: 'Estado', label: 'estado' }
    ];

    useEffect(() =>
    {
        if (error)
        {
            console.error('Error al cargar los datos de suministros:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }

        try
        {
            const fetchSupplies = async () =>
            {
                const supplies = await execute();

                if (supplies)
                {
                    setSuppliesData(supplies);
                    const filtered = filterItems(supplies, currentFilters);
                    setFilteredData(filtered);
                }

                const supplierData = await executeSupplier();

                if (supplierData)
                {
                    const baseConfig = mockData.supplies.inputConfig;
                    const supplierOptions = supplierData.map((supplier) => ({
                        value: supplier.id,
                        label: supplier.name
                    }));

                    setInputConfig({
                        ...baseConfig,
                        selectOptions: {
                            ...baseConfig.selectOptions,
                            'supplierId': supplierOptions
                        }
                    });
                }
            }

            fetchSupplies();
            setConfig(mockData.supplies.config);
        }
        catch (error)
        {
            console.error('Error al cargar los datos de suministros:', error);
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
        const filtered = filterItems(suppliesData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(suppliesData); // Mostrar todos los datos sin filtrar
    };

    const handleOverlayClick = () =>
    {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData: Record<string, any>) =>
    {
        const supplyData = {
            ...formData,
            supplierId: formData.supplierId,
            minStock: Number(formData.minStock),
            stock: Number(formData.stock),
            available: true
        };

        try
        {
            const newSupply = await execute({
                method: 'POST',
                body: supplyData
            });

            if (newSupply)
            {
                setIsModalOpen(false);

                toast.success('Insumo creado correctamente', {
                    description: "El insumo ha sido creado exitosamente.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const supplies = await execute();

                if (supplies)
                {
                    setSuppliesData(supplies);
                    setFilteredData(supplies);
                }
            }
        }
        catch (error)
        {
            console.error('Error al crear el suministro:', error);
            toast.error(`Error al crear el suministro: ${error}`, {
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
            console.error('Error al seleccionar el archivo:', e);
            toast.error(`Error al seleccionar el archivo`, {
                description: e instanceof Error ? e.message : 'Error desconocido',
                duration: 5000,
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
            }, '/api/supply/upload');

            if (!result && errorFile) throw new Error(errorFile);

            if (result)
            {
                toast.success(`Archivo procesado correctamente`, {
                    description: `${result.created} insumos creados, ${result.failed} errores`,
                    duration: 5000,
                    richColors: true,
                    position: 'top-right'
                });

                if (result.errors.length > 0) {
                    console.log('Errores en el procesamiento:', result.errors);
                    setUploadResult(result);
                    setIsErrorModalOpen(true);
                }

                const supplies = await execute();

                if (supplies)
                {
                    setSuppliesData(supplies);
                    setFilteredData(supplies);
                }
            }
        }
        catch (e)
        {
            console.error('Error al subir el archivo:', e);
            toast.error(`Error al procesar el archivo`, {
                description: e instanceof Error ? e.message.split('Error code')[0] : 'Error desconocido',
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
        { key: 'name'},
        { key: 'unit'},
        { key: 'stock'},
        { key: 'price'},
        { key: 'minStock'},
        { key: 'supplierId'},
    ];

    const createSupply = (): ReactNode =>
    {
        return (
            <GenericForm
                type={"Insumo"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.supplies}>
            {uploadResult && (
                <LoadErrorModal
                    isOpen={isErrorModalOpen}
                    onClose={() => setIsErrorModalOpen(false)}
                    uploadResult={uploadResult}
                />
            )}
            <div className={styles.suppliesTop}>
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
                        domain="supply"
                    />
                </div>
            </div>
            <GenericDataTable
                data={filteredData}
                config={config}
            />
            {isModalOpen && (
                <Modal children={createSupply()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default Supplies;
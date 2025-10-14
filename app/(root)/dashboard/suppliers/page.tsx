'use client';

import styles from './page.module.css';
import GenericDataTable from "@/app/components/shared/genericdatatable/GenericDataTable";
import { ReactNode, useEffect, useState } from 'react';
import mockData from "@/app/components/shared/data/mockData.json";
import { Create, Download, Upload } from '@/app/components/svg';
import GenericFilter, { FilterConfig, filterItems } from '@/app/components/shared/genericfilter/GenericFilter';
import GenericForm from '@/app/components/shared/genericform/GenericForm';
import Modal from '@/app/components/shared/modal/Modal';
import { Supplier } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import DownloadButton from '@/app/components/shared/downloadbutton/DownloadButton';

interface SupplierConfig {
    columns: any[];
    itemsPerPage?: number;
    pageLabels?: {
        showing?: string;
        of?: string;
    }
}

interface InputConfig {
    fieldTypes: Record<string, string>;
    selectOptions: Record<string, string[]>;
    labelTranslations: Record<string, string>;
    placeholderTranslations: Record<string, string>;
}

const Suppliers = () =>
{
    const [isGenerating, setIsGenerating] = useState(false);
    const [suppliersData, setSuppliersData] = useState<Supplier[]>([]);
    const [filteredData, setFilteredData] = useState<Supplier[]>([]);
    const [config, setConfig] = useState<SupplierConfig>({columns: []});
    const [inputConfig, setInputConfig] = useState<InputConfig>({
        fieldTypes: {},
        selectOptions: {},
        labelTranslations: {},
        placeholderTranslations: {}
    });
    const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoading, error, execute } = useFetch<Supplier[]>('/api/supplier', {
        immediate: false
    });
    const { isLoading: isLoadingFile, error: errorFile, execute: executeFile } = useFetch('/api/supplier/export', {
        immediate: false
    });

    // Configuración de filtros
    const filterConfig: FilterConfig[] = [
        { field: 'name', placeholder: 'Nombre', label: 'nombre' },
        { field: 'email', placeholder: 'Email', label: 'email' },
        { field: 'available', placeholder: 'Estado', label: 'estado' }
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
            const fetchSuppliers = async () =>
            {
                const suppliers = await execute();

                if (suppliers)
                {
                    setSuppliersData(suppliers);
                    const filtered = filterItems(suppliers, currentFilters);
                    setFilteredData(filtered);
                }
            }

            fetchSuppliers();
            setConfig(mockData.suppliers.config);
            setInputConfig(mockData.suppliers.inputConfig);
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
        const filtered = filterItems(suppliersData, filters);
        setFilteredData(filtered);
    };

    // Función para resetear filtros
    const handleResetFilters = () =>
    {
        setCurrentFilters({});
        setFilteredData(suppliersData); // Mostrar todos los datos sin filtrar
    };

    const handleOverlayClick = () =>
    {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData: Record<string, any>) =>
    {
        const supplierData = {
            ...formData,
            available: true
        };

        try
        {
            const newSupplier = await execute({
                method: 'POST',
                body: supplierData
            });

            if (newSupplier && !error)
            {
                setIsModalOpen(false);

                toast.success('Proveedor creado correctamente!', {
                    description: "El proveedor ha sido añadido exitosamente.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });

                const suppliers = await execute();

                if (suppliers)
                {
                    setSuppliersData(suppliers);
                    setFilteredData(suppliers);
                }
            }
        }
        catch (error)
        {
            console.error('Error al crear el proveedor:', error);
            toast.error(`Error al crear el proveedor: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const columns = [
        { key: 'typeId'},
        { key: 'docId'},
        { key: 'name'},
        { key: 'email'},
        { key: 'contactName'},
        { key: 'phone'},
        { key: 'address'}
    ];

    const createSupplier = (): ReactNode =>
    {
        return (
            <GenericForm
                hasImage={true}
                type={"Proveedor"}
                columns={columns}
                onSubmit={handleSubmit}
                onClose={handleOverlayClick}
                inputConfig={inputConfig}
            />
        );
    }

    return (
        <div className={styles.suppliers}>
            <div className={styles.suppliersTop}>
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
                        domain="supplier"
                    />
                </div>
            </div>
            <GenericDataTable
                data={filteredData}
                config={config}
            />
            {isModalOpen && (
                <Modal children={createSupplier()} onClose={handleOverlayClick} />
            )}
        </div>
    );
}

export default Suppliers;
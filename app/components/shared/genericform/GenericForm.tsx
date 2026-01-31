import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import styles from './genericform.module.css';
import { toast } from 'sonner';

type Column = {
    key: string;
};

interface GenericFormProps {
    hasImage: boolean;
    type: string
    columns: Column[];
    onSubmit: (data: Record<string, any>, file?: File | null) => void;
    onClose: () => void;
    inputConfig: {
        fieldTypes: Record<string, string>;
        selectOptions?: Record<string, string[] | { value: string; label: string; }[]>;
        labelTranslations: Record<string, string>;
        placeholderTranslations: Record<string, string>;
    }
    initialData?: Record<string, any>;
}

const GenericForm = ({  hasImage, type, columns, onSubmit, onClose, inputConfig, initialData = {} }: GenericFormProps) =>
{
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const initFormData = () =>
    {
        const initialFormData: Record<string, any> = {};

        if (columns && columns.length > 0)
        {
            columns.forEach(column =>
            {
                initialFormData[column.key] = initialData[column.key] || '';
            });
        }
        return initialFormData;
    };

    const [formData, setFormData] = useState<Record<string, any>>(initFormData);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() =>
    {
        const newFormData: Record<string, any> = {};

        if (columns && columns.length > 0)
        {
            columns.forEach(column =>
            {
                newFormData[column.key] = initialData[column.key] || formData[column.key] || '';
            });

            const hasChanges = Object.keys(newFormData).some(
                key => formData[key] !== newFormData[key]
            );

            if (hasChanges) setFormData(newFormData);
        }
    }, [JSON.stringify(initialData), JSON.stringify(columns.map(c => c.key))]);

    const validateInput = (key: string, value: string): string =>
    {
        switch (key)
        {
            case 'phone':
                return value.replace(/[^0-9\s()\-+]/g, '');
            case 'centralStock':
                let centralStockValue = value.replace(/[^0-9]/g, '');
                if (centralStockValue === '') return '';
                const centralStockNum = parseInt(centralStockValue);
                return centralStockNum < 0 ? '0' : centralStockValue;
            case 'minStock':
                let minstockValue = value.replace(/[^0-9]/g, '');
                if (minstockValue === '') return '';
                const minstockNum = parseInt(minstockValue);
                return minstockNum < 0 ? '0' : minstockValue;
            case 'stock':
                let stockValue = value.replace(/[^0-9]/g, '');
                if (stockValue === '') return '';
                const stockNum = parseInt(stockValue);
                return stockNum < 0 ? '0' : stockValue;
            case 'quantity':
                let quantityValue = value.replace(/[^0-9]/g, '');
                if (quantityValue === '') return '';
                const quanityNum = parseInt(quantityValue);
                return quanityNum < 0 ? '0' : quantityValue;
            case 'price':
                let priceValue = value.replace(/[^\d.]/g, '');
                priceValue = priceValue.replace(/(\..*)\./g, '$1');
                if (priceValue === '' || priceValue === '.') return priceValue;
                const priceNum = parseFloat(priceValue);
                return priceNum < 0 ? '0' : priceValue;
            case 'basePrice':
                let basepriceValue = value.replace(/[^\d.]/g, '');
                basepriceValue = basepriceValue.replace(/(\..*)\./g, '$1');
                if (basepriceValue === '' || basepriceValue === '.') return basepriceValue;
                const basepriceNum = parseFloat(basepriceValue);
                return basepriceNum < 0 ? '0' : basepriceValue;
            case 'name':
                return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            case 'productName':
                return value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '');
            case 'docId':
                return value.replace(/[^0-9-]/g, '');
            case 'email':
                return value.replace(/[^a-zA-Z0-9@.\-_]/g, '');
            default:
                return value;
        }
    }

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validateFormBeforeSubmit = (): boolean => {
        if (formData.email && formData.email.trim() !== '') {
            if (!validateEmail(formData.email)) {
                toast.error('Email inválido', {
                    description: "Por favor, ingrese un email válido (ejemplo: usuario@dominio.com)",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return false;
            }
        }

        return true;
    };

    const handleChange = (key: string, value: any) =>
    {
        const validatedValue = typeof value === 'string' ? validateInput(key, value) : value;

        setFormData(prev => ({
            ...prev,
            [key]: validatedValue
        }));
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) =>
    {
        const file = e.target.files?.[0];

        if (file)
        {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: FormEvent) =>
    {
        e.preventDefault();

        if (!validateFormBeforeSubmit()) return;

        onSubmit(formData, selectedFile);
    };

    const renderField = (column: Column) =>
    {
        const { key } = column;
        const fieldType = inputConfig.fieldTypes[key] || 'text';
        const label = inputConfig.labelTranslations[key] || key;
        const placeholder = inputConfig.placeholderTranslations[key] || `Ingrese ${key}`;
        const value = formData[key] || '';

        if (key === 'typeId')
        {
            return (
                <div className={styles.idGroup} key={key}>
                    <label htmlFor="document">{inputConfig.labelTranslations['docId']}:</label>
                    <div className={styles.documentContainer}>
                        <select
                            id="typeId"
                            value={formData['typeId'] || ''}
                            onChange={(e) => handleChange('typeId', e.target.value)}
                            className={`${styles.formControl} ${styles.documentSelect}`}
                        >
                            <option value="">{inputConfig.placeholderTranslations['typeId']}</option>
                            {inputConfig.selectOptions && inputConfig.selectOptions['typeId']?.map((option) => {
                                if (typeof option === 'object' && 'value' in option && 'label' in option) {
                                    return (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    );
                                }
                                return (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                )
                            })}
                        </select>
                        <input
                            type="text"
                            id="docId"
                            value={formData['docId'] || ''}
                            onChange={(e) => handleChange('docId', e.target.value)}
                            placeholder={inputConfig.placeholderTranslations['docId'] || 'Número de documento'}
                            className={`${styles.formControl} ${styles.documentInput}`}
                        />
                    </div>
                </div>
            );
        }

        // Si es docId, no renderizar nada (ya se renderizó con typeId)
        if (key === 'docId') {
            return null;
        }

        switch (fieldType)
        {
            case 'select':
                return (
                    <div className={styles.formGroup} key={key}>
                        <label htmlFor={key}>{label}:</label>
                        <select
                            id={key}
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className={styles.formControl}
                        >
                            <option value="">{placeholder}</option>
                            {inputConfig.selectOptions && inputConfig.selectOptions[key]?.map((option) =>{
                                if (typeof option === 'object' && 'value' in option && 'label' in option)
                                {
                                    return (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    );
                                }

                                return (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                );
            case 'number':
                return (
                    <div className={styles.formGroup} key={key}>
                        <label htmlFor={key}>{label}:</label>
                        <input
                            type='number'
                            id={key}
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            min={0}
                            step='1'
                            placeholder={placeholder}
                            className={styles.formControl}
                            onKeyDown={(e) => {
                                if (key === 'centralStock')
                                {
                                    // Para centralStock no permite punto, coma, ni signo negativo
                                    if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                                }
                            }}

                        />
                    </div>
                );
            case 'date':
                return (
                    <div className={styles.formGroup} key={key}>
                        <label htmlFor={key}>{label}:</label>
                        <input
                            type="date"
                            id={key}
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className={styles.formControl}
                        />
                    </div>
                );
            default:
                return (
                    <div className={styles.formGroup} key={key}>
                        <label htmlFor={key}>{label}:</label>
                        <input
                            type="text"
                            id={key}
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={placeholder}
                            className={styles.formControl}
                            step={key === 'basePrice' ? '0.01' : '1'}
                            onKeyDown={(e) => {
                                if (key === 'basePrice')
                                {
                                    // Para basePrice no permite signo negativo, pero sí punto
                                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                                    // Solo permite un punto decimal
                                    if (e.key === '.' && value.includes('.')) e.preventDefault();
                                }
                            }}
                        />
                    </div>
                );
        }
    }

    return (
        <div className={styles.genericFormContainer}>
            <h2 className={styles.formTitle}>Crear {type}</h2>

            <form onSubmit={handleSubmit}>
                <div className={styles.formContainer}>
                    {hasImage && (
                        <div className={styles.imageUploadContainer}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Vista previa"
                                    className={styles.imagePreview}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <p>Drag image here<br />or</p>
                                    <button
                                        type="button"
                                        className={styles.browseButton}
                                        onClick={() => document.getElementById('productImage')?.click()}
                                    >
                                        Browse image
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                id="productImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.hiddenInput}
                            />
                        </div>
                    )}

                    <div className={styles.formFields}>
                        {columns.map(column => renderField(column))}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        Crear {type}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GenericForm;
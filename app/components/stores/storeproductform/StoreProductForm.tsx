import styles from './storeproductform.module.css';
import { useState } from 'react';
import { StoreProduct } from '@/interfaces/interfaces';

interface StoreProductFormProps {
    storeProduct?: StoreProduct | null;
    handlePatchStoreProduct?: (storeProductId: string, productId: string, updatedData: Partial<StoreProduct>) => Promise<void>;
    onClose: () => void;
}

const StoreProductForm = ({ storeProduct, handlePatchStoreProduct, onClose }: StoreProductFormProps) =>
{
    const [formData, setFormData] = useState({
        productId: storeProduct?.product?.id || '',
        productName: storeProduct?.product?.name || '',
        allocatedStock: storeProduct?.allocatedStock || 0,
        currentStock: storeProduct?.currentStock || 0,
        minStock: storeProduct?.minStock || 0,
        price: storeProduct?.price || '',
        available: storeProduct?.available ?? true,
    });

    const [hasChanges, setHasChanges] = useState(false);

    const handleChange = (field: string, value: any) =>
    {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }

    const handleSubmit = (e: React.FormEvent) =>
    {
        e.preventDefault();

        if (storeProduct && handlePatchStoreProduct && hasChanges)
        {
            const updatedData: Partial<StoreProduct> = {};

            if (formData.allocatedStock !== storeProduct.allocatedStock) updatedData.allocatedStock = formData.allocatedStock;
            if (formData.currentStock !== storeProduct.currentStock) updatedData.currentStock = formData.currentStock;
            if (formData.minStock !== storeProduct.minStock) updatedData.minStock = formData.minStock;
            if (formData.available !== storeProduct.available) updatedData.available = formData.available;

            if (Object.keys(updatedData).length > 0)
            {
                handlePatchStoreProduct(storeProduct.id, formData.productId, updatedData).then();
                onClose();
            }
            else
            {
                console.log("No se realizaron cambios.");
            }
        }
    }

    return (
        <div className={styles.storeproductform}>
            <div>
                <h2>Editar Producto de Tienda</h2>
                <p>Modifica la información del producto en esta tienda.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="productName">Nombre del Producto:</label>
                    <input
                        type="text"
                        id="productName"
                        name="productName"
                        value={formData.productName}
                        className={styles.formControl}
                        disabled
                    />
                </div>

                <div className={styles.formRow}>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="allocatedStock">Stock Asignado:</label>
                        <input
                            type="number"
                            id="allocatedStock"
                            name="allocatedStock"
                            value={formData.allocatedStock}
                            onChange={(e) => handleChange('allocatedStock', Number(e.target.value))}
                            className={styles.formControl}
                            min="0"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="currentStock">Stock Actual:</label>
                        <input
                            type="number"
                            id="currentStock"
                            name="currentStock"
                            value={formData.currentStock}
                            onChange={(e) => handleChange('currentStock', Number(e.target.value))}
                            className={styles.formControl}
                            min="0"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="minStock">Stock Mínimo:</label>
                        <input
                            type="number"
                            id="minStock"
                            name="minStock"
                            value={formData.minStock}
                            onChange={(e) => handleChange('minStock', Number(e.target.value))}
                            className={styles.formControl}
                            min="0"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price">Precio:</label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            disabled
                            className={styles.formControl}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={formData.available}
                            onChange={(e) => handleChange('available', e.target.checked)}
                        />
                        <span>Disponible para venta</span>
                    </label>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitButton} disabled={!hasChanges}>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StoreProductForm;
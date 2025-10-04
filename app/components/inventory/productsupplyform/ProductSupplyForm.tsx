import styles from './productsupplyform.module.css';
import { useState } from 'react';
import { ProductSupply } from '@/interfaces/interfaces';

interface ProductSupplyFormProps {
    productSupply? : ProductSupply | null;
    handlePatchSupply?: (supplyId: string, amountUsed: number) => Promise<void>;
    onClose: () => void;
}

const ProductSupplyForm = ({ productSupply, handlePatchSupply, onClose }: ProductSupplyFormProps) =>
{
    const prevAmount = productSupply ? productSupply.amountUsed : 0;
    const [formData, setFormData] = useState({
        supplyId: productSupply ? productSupply.supply?.id : '',
        supplyName: productSupply ? productSupply.supply?.name : '',
        quantity: productSupply ? productSupply.amountUsed : 0,
    });

    const handleSubmit = (e: React.FormEvent) =>
    {
        e.preventDefault();

        if (productSupply && handlePatchSupply)
        {
            if (formData.quantity !== prevAmount)
            {
                handlePatchSupply(formData.supplyId ? formData.supplyId : '', Number(formData.quantity)).then();
                onClose();
            }
            else
            {
                console.log("No changes made to the amount.");
            }
        }
    }

    const validateAmount = (value: string) =>
    {
        /// Solo permite números y un punto decimal
        let amountValue = value.replace(/[^\d.]/g, '');
        // Evita múltiples puntos decimales
        amountValue = amountValue.replace(/(\..*)\./g, '$1');
        // Verifica que no sea negativo
        if (amountValue === '' || amountValue === '.') return amountValue;
        const valueNum = parseFloat(amountValue);
        return valueNum < 0 ? '0' : amountValue;
    }

    return (
        <div className={styles.productsupplyform}>
            <div>
                <h2>Formulario de Insumos</h2>
                <p>Modifica la cantidad de insumos utilizados para este producto.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="supplyName">Nombre del Insumo:</label>
                    <input
                        type="text"
                        id="supplyName"
                        name="supplyName"
                        value={formData.supplyName}
                        className={styles.formControl}
                        disabled
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="quantity">Cantidad:</label>
                    <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: validateAmount(e.target.value) })}
                        onKeyDown={(e) => {
                            // Para basePrice no permite signo negativo, pero sí punto
                            if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                            // Solo permite un punto decimal
                            if (e.key === '.' && e.currentTarget.value.includes('.')) e.preventDefault();
                        }}
                        className={styles.formControl}
                    />
                </div>
                <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitButton}>
                        Guardar Insumo
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductSupplyForm;
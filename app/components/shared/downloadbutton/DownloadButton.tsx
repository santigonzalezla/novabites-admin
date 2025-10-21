import styles from './downloadbutton.module.css';
import { Download } from '@/app/components/svg';
import { toast } from 'sonner';

interface DownloadButtonProps {
    isGenerating: boolean;
    setIsGenerating: (value: boolean) => void;
    executeFile: (options?: any, overrideUrl?: string) => Promise<Blob | null>;
    domain: string
}

const DownloadButton = ({ isGenerating, setIsGenerating, executeFile, domain }: DownloadButtonProps) =>
{
    const downloadFile = (blob: Blob, filename: string) =>
    {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const setFileName = (domain: string) =>
    {
        switch (domain)
        {
            case 'supply':
                return `insumos_${new Date().toISOString().split('T')[0]}`;
            case 'product':
                return `productos_${new Date().toISOString().split('T')[0]}`;
            case 'client':
                return `clientes_${new Date().toISOString().split('T')[0]}`;
            case 'supplier':
                return `proveedores_${new Date().toISOString().split('T')[0]}`;
            case 'user':
                return `usuarios_${new Date().toISOString().split('T')[0]}`;
            case 'order':
                return `ordenes_${new Date().toISOString().split('T')[0]}`;
            case 'custom-order':
                return `ordenes_personalizadas_${new Date().toISOString().split('T')[0]}`;
            case 'store-request':
                return `solicitudes_tienda_${new Date().toISOString().split('T')[0]}`;
            case 'category-product':
                return `categorias_productos_${new Date().toISOString().split('T')[0]}`;
            case 'subcategory-product':
                return `subcategorias_productos_${new Date().toISOString().split('T')[0]}`;
            default:
                return `archivo_${new Date().toISOString().split('T')[0]}`;
        }
    }

    const handleFileDownload = async () =>
    {
        setIsGenerating(true);

        try
        {
            const file = await executeFile({
                method: 'GET',
                responseType: 'blob'
            }, `/api/${domain}/export`);

            if (file)
            {
                const filename = setFileName(domain)

                downloadFile(file, filename);

                toast.success('PDF generado exitosamente', {
                    description: "El archivo se ha descargado.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error('Error generando Excel:', e);
            toast.error('Error generando PDF', {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        finally
        {
            setIsGenerating(false);
        }
    }

    return (
        <button className={styles.download} onClick={handleFileDownload} disabled={isGenerating}>
            <Download />
        </button>
    );
}

export default DownloadButton;
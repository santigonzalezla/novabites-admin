import styles from './dowloadunitbutton.module.css';
import { toast } from 'sonner';

interface DownloadUnitButtonProps {
    isGenerating: boolean;
    setIsGenerating: (value: boolean) => void;
    executeFile: (options?: any, overrideUrl?: string) => Promise<Blob | null>;
    domain: string;
    domainId: string;
}

const DownloadUnitButton = ({ isGenerating, setIsGenerating, executeFile, domain, domainId }: DownloadUnitButtonProps) =>
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
                return `insumo_${new Date().toISOString().split('T')[0]}`;
            case 'product':
                return `producto_${new Date().toISOString().split('T')[0]}`;
            case 'client':
                return `cliente_${new Date().toISOString().split('T')[0]}`;
            case 'supplier':
                return `proveedor_${new Date().toISOString().split('T')[0]}`;
            case 'user':
                return `usuario_${new Date().toISOString().split('T')[0]}`;
            case 'order':
                return `orden_${new Date().toISOString().split('T')[0]}`;
            case 'custom-order':
                return `orden_personalizada_${new Date().toISOString().split('T')[0]}`;
            case 'store-request':
                return `solicitud_tienda_${new Date().toISOString().split('T')[0]}`;
            case 'category-product':
                return `categoria_producto_${new Date().toISOString().split('T')[0]}`;
            case 'store':
                return `tienda_${new Date().toISOString().split('T')[0]}`;
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
            }, `/api/${domain}/export/${domainId}`);

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
        <button className={styles.downloadButton} onClick={handleFileDownload} disabled={isGenerating}>
            Descargar
        </button>
    );
}

export default DownloadUnitButton;
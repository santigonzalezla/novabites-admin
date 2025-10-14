import styles from './productlog.module.css';
import LogContainer from '@/app/components/shared/logcontainer/LogContainer';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Log } from '@/interfaces/interfaces';

const ProductLog = () =>
{
    const pathname = usePathname();
    const productId = pathname.split('/').pop();
    const { isLoading, error, execute } = useFetch<Log[]>(`/api/log?productId=${productId}`);
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            try
            {
                const logs = await execute();

                if (logs)
                {
                    setLogs(logs);
                    console.log("Fetched logs:", logs);
                }
            }
            catch (e)
            {
                console.error("Error fetching logs:", e);
            }
        }

        fetchData();
    }, []);

    return (
        <div className={styles.logcontainer}>
            <LogContainer logs={logs} />
        </div>
    );
}

export default ProductLog;
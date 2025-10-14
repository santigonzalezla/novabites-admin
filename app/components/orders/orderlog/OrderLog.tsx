import styles from './orderlog.module.css';
import LogContainer from '@/app/components/shared/logcontainer/LogContainer';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Log } from '@/interfaces/interfaces';

const OrderLog = () =>
{
    const pathname = usePathname();
    const orderId = pathname.split('/').pop();
    const { isLoading, error, execute } = useFetch<Log[]>(`/api/log?orderId=${orderId}`);
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

export default OrderLog;
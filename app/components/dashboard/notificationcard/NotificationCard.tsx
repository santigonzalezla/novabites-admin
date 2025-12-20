import styles from './notificationcard.module.css';
import {TimeAgo} from "@/app/components/svg";
import Image from "next/image";
import { useFetch } from '@/hooks/useFetch';
import { useEffect, useState } from 'react';
import { Notification } from '@/interfaces/interfaces';

const NotificationCard = () =>
{
    const [ notifications, setNotifications] = useState<Notification[]>([]);
    const { isLoading, error, execute } = useFetch('/api/notification', {
        immediate: false,
    });

    useEffect(() =>
    {
        const fetchNotifications = async () =>
        {
            const data = await execute();

            if (data)
            {
                setNotifications(data);
            }
        }

        fetchNotifications();
    }, []);

    const formatTime = (date: Date) =>
    {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffMs = now.getTime() - notificationDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return notificationDate.toLocaleDateString();
    }

    return (
        <div className={styles.notifcationcard}>
            <h1>Notificationes</h1>
            <div className={styles.notifcationcardcontainer}>
                {notifications.length > 0 ? notifications.map((notification, index) => (
                    <div key={index} className={styles.notificationinfo}>
                        <div className={styles.infoleft}>
                            <Image src="/user.png" alt="user" width={50} height={50} />
                            <div>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                            </div>
                        </div>
                        <div className={styles.inforight}>
                            <TimeAgo/>
                            <p>{formatTime(notification.createdAt)} ago</p>
                        </div>
                    </div>
                )) : (
                    <div className={styles.notificationempty}>
                        <p>No hay notificationes</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationCard;
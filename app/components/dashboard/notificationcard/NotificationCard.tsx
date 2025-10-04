import styles from './notificationcard.module.css';
import {TimeAgo} from "@/app/components/svg";
import Image from "next/image";

const NotificationCard = () =>
{
    const notifications = [
        {
            name: 'Santiago Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min'
        },
        {
            name: 'Sergio Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min '
        },
        {
            name: 'Salomon Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min'
        },
        {
            name: 'Shimon Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min'
        },
        {
            name: 'Salomon Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min'
        },
        {
            name: 'Shimon Gonzalez',
            message: 'Ha enviado un mensaje',
            time: '5 min'
        }
    ]

    return (
        <div className={styles.notifcationcard}>
            <h1>Notificationes</h1>
            <div className={styles.notifcationcardcontainer}>
                {notifications.map((notification, index) => (
                    <div key={index} className={styles.notificationinfo}>
                        <div className={styles.infoleft}>
                            <Image src="/user.png" alt="user" width={50} height={50} />
                            <div>
                                <h3>{notification.name}</h3>
                                <p>{notification.message}</p>
                            </div>
                        </div>
                        <div className={styles.inforight}>
                            <TimeAgo/>
                            <p>{notification.time} ago</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NotificationCard;
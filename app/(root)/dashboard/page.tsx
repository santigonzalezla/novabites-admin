import styles from './page.module.css';
import { Bell, EarningsIcon, Order, Supplies } from '@/app/components/svg';
import StatsCard from '@/app/components/dashboard/statscard/StatsCard';
import NotificationCard from '@/app/components/dashboard/notificationcard/NotificationCard';
import ChartData from '@/app/components/dashboard/chart/ChartData';

const cards = [
    {
        link: 'inventory',
        title: 'Products',
        value: '431',
        relation: 11,
        icon: <Supplies />,
        color: 'FF4200'
    },
    {
        link: 'orders',
        title: 'Ordenes',
        value: '20',
        relation: 2,
        icon: <Order />,
        color: '2B3138'
    },
    {
        link: 'reports',
        title: 'Ganancias',
        value: '7,500$',
        relation: 54,
        icon: <EarningsIcon />,
        color: '62FF6B'
    },
    {
        link: 'messages',
        title: 'Interacciones',
        value: '5,463',
        relation: -5,
        icon: <Bell />,
        color: '95A4FC'
    }
];

const Dashboard = () =>
{
    return (
        <div className={styles.dashboard}>
            <div className={styles.cards}>
                {cards.map((card, index) => (
                    <StatsCard
                        key={index}
                        link={card.link}
                        title={card.title}
                        value={card.value}
                        relation={card.relation}
                        icon={card.icon}
                        color={card.color}
                    />
                ))}
            </div>
            <div className={styles.infoapp}>
                <ChartData />
                <NotificationCard />
            </div>
        </div>
    );
}

export default Dashboard;
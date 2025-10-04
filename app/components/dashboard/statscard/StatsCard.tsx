import styles from './statscard.module.css';
import {ReactNode} from "react";
import Link from 'next/link';

interface StatsCardProps {
    link: string;
    title: string;
    value: string;
    relation: number;
    icon: ReactNode;
    color: string;
}

const StatsCard = ({link, title, value, relation, icon, color}: StatsCardProps) =>
{
    const getBackgroundColorWithOpacity = (hexColor: string, opacity: number) =>
    {
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
        //add a hover effect to the card
        <Link href={`/dashboard/${link}`} className={styles.statscard} style={{ backgroundColor: getBackgroundColorWithOpacity(color, 0.3) }}>
            <div className={styles.icon} style={{ backgroundColor: getBackgroundColorWithOpacity(color, 0.4)}} >
                {icon}
            </div>
            <h1>{title}</h1>
            <div className={styles.stats}>
                <p className={styles.cardvalue}>{value}</p>
                <p>
                    <span>{relation}%</span>
                </p>
            </div>
        </Link>
    );
}

export default StatsCard;
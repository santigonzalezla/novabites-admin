'use client';

import styles from './page.module.css';
import SupplySection from '@/app/components/supplies/supplysection/SupplySection';

const Supplies = () =>
{
    return (
        <div className={styles.supplies}>
            <SupplySection />
        </div>
    )
}

export default Supplies;
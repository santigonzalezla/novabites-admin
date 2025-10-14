'use client';

import styles from './page.module.css';
import CategorySection from '@/app/components/categories/categorysection/CategorySection';


const Supplier = () =>
{
    return (
        <div className={styles.provider}>
            <CategorySection />
        </div>
    )
}

export default Supplier;
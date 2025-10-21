'use client';

import styles from './page.module.css';
import SubcategorySection from '@/app/components/subcategories/subcategorysection/SubcategorySection';


const Category = () =>
{
    return (
        <div className={styles.provider}>
            <SubcategorySection />
        </div>
    )
}

export default Category;
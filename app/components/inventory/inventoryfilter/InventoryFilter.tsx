'use client';

import styles from './clientfilter.module.css';
import { ArrowDown, Filter, Reset } from '@/app/components/svg';

const InventoryFilter = () =>
{
    return (
        <div className={styles.filter}>
            <div className={styles.filtericon}>
                <Filter/>
            </div>
            <div className={styles.filterby}>
                <span>Filtar por</span>
            </div>
            <div className={styles.filtercontent}>
                <input type={'text'} placeholder={'Buscar por'} />
                <ArrowDown />
            </div>
            <div className={styles.filtercontent}>
                <input type={'text'} placeholder={'Buscar por'} />
                <ArrowDown />
            </div>
            <div className={styles.filtercontent}>
                <input type={'text'} placeholder={'Buscar por'} />
                <ArrowDown />
            </div>
            <div className={styles.filterreset}>
                <Reset/>
                Limpiar Filtro
            </div>
        </div>
    );
}

export default InventoryFilter;
'use client';

import styles from './page.module.css';
import RequestSection from '@/app/components/requests/requestsection/RequestSection';
import CashClosingSection from '@/app/components/cashclosing/cashclosingsection/CashClosingSection';


const CashClosing = () =>
{
    return (
        <div className={styles.orders}>
            <CashClosingSection />
        </div>
    )
}

export default CashClosing;
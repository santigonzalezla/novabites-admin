'use client';

import styles from './page.module.css';
import RequestSection from '@/app/components/requests/requestsection/RequestSection';


const Request = () =>
{
    return (
        <div className={styles.orders}>
            <RequestSection />
        </div>
    )
}

export default Request;
'use client';

import styles from './page.module.css';
import SalesAreaChart from '@/app/components/reports/salesareachart/SalesAreaChart';
import StoreBarChart from '@/app/components/reports/storebarchart/StoreBarChart';
import UserBarChart from '@/app/components/reports/userbarchart/UserBarChart';
import StoreRequestChart from '@/app/components/reports/storerequestchart/StoreRequestChart';
import RolePieChart from '@/app/components/reports/rolepiechart/RolePieChart';
import withAuth from '@/hoc/withAuth';
import { Role } from '@/interfaces/enums';

const Reports = () =>
{
    return (
        <div className={styles.reports}>
            <SalesAreaChart />
            <StoreBarChart />
            <UserBarChart />
            <StoreRequestChart />
            <RolePieChart />
        </div>
    );
}

export default withAuth(Reports, { allowedRoles: [Role.ADMIN, Role.MANAGER] });
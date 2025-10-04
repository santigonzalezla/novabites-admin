import SalesAreaChart from '@/app/components/reports/salesareachart/SalesAreaChart';
import StoreBarChart from '@/app/components/reports/storebarchart/StoreBarChart';
import UserBarChart from '@/app/components/reports/userbarchart/UserBarChart';
import StoreRequestChart from '@/app/components/reports/storerequestchart/StoreRequestChart';
import RolePieChart from '@/app/components/reports/rolepiechart/RolePieChart';

const Reports = () =>
{
    return (
        <div>
            <SalesAreaChart />
            <StoreBarChart />
            <UserBarChart />
            <StoreRequestChart />
            <RolePieChart />
        </div>
    );
}

export default Reports;
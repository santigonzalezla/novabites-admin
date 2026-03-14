'use client';

import styles from './chartdata.module.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartPoint {
    name: string;
    ingresos: number;
    gastos: number;
}

interface ChartDataProps {
    data?: ChartPoint[];
}

const fallbackData = [
    { name: 'Ene', ganancias: 4000, gastos: 2400 },
    { name: 'Feb', ganancias: 3000, gastos: 1398 },
    { name: 'Mar', ganancias: 2000, gastos: 9800 },
    { name: 'Abr', ganancias: 2780, gastos: 3908 },
    { name: 'May', ganancias: 1890, gastos: 4800 },
    { name: 'Jun', ganancias: 3490, gastos: 4300 },
];

const ChartData = ({ data }: ChartDataProps) =>
{
    const chartData = data && data.length > 0
        ? data
        : fallbackData.map(item => ({ name: item.name, ingresos: item.ganancias, gastos: item.gastos }));

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <h3>Ingresos vs Gastos (Mes Actual)</h3>
            </div>
            <ResponsiveContainer width={'100%'} height={'100%'}>
                <LineChart
                    className={styles.linechart}
                    width={500}
                    height={200}
                    data={chartData}
                    margin={{ top: 5, right: 30, bottom: 5 }}
                >
                    <XAxis dataKey="name" fontSize="12px" />
                    <YAxis fontSize="12px" />
                    <Tooltip wrapperStyle={{ fontSize: '12px' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="gastos" name="Gastos" stroke="#ff6b6b" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ChartData;

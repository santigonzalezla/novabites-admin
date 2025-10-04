'use client';

import styles from './chartdata.module.css';
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from 'recharts';

const data = [
    {
        name: '',
        uv: 2000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Ene',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Feb',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Mar',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Abr',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'May',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Jun',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

const ChartData = () =>
{
    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <h3>Total Clientes</h3>
                <h3>Total Ganancias</h3>
            </div>
            <ResponsiveContainer width={'100%'} height={'100%'}>
                <LineChart
                    className={styles.linechart}
                    width={500}
                    height={200}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        bottom: 5,
                    }}
                >
                    <XAxis dataKey="name" fontSize="12px" />
                    <YAxis fontSize="12px" />
                    <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ChartData;
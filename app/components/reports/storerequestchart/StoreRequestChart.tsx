'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './storerequestchart.module.css';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StoreRequest } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';

interface ChartData {
    period: string;
    pendingSupply: number;
    completedSupply: number;
    pendingReturn: number;
    completedReturn: number;
    totalPending: number;
    totalCompleted: number;
    completionRate: number;
}

const StoreRequestChart = () => 
{
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [requestType, setRequestType] = useState<'ALL' | 'SUPPLY_REQUEST' | 'RETURN_REQUEST'>('ALL');
    const { data: storeRequests, error: requestError, isLoading: requestLoading, execute: fetchRequests } = useFetch<StoreRequest[]>(`/api/store-request`, {
        immediate: false,
    });

    const formatPeriod = (date: Date, periodType: 'daily' | 'weekly' | 'monthly') =>
    {
        switch (periodType)
        {
            case 'daily':
                return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                return `Sem ${weekStart.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}`;
            case 'monthly':
                return date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
            default:
                return date.toLocaleDateString('es-CO');
        }
    };

    const processRequestData = (requests: StoreRequest[]) =>
    {
        const groupedData: { [key: string]: {
                pendingSupply: number,
                completedSupply: number,
                pendingReturn: number,
                completedReturn: number,
                originalDate: Date
            }} = {};

        requests?.forEach(request =>
        {
            const date = new Date(request.createdAt);
            const periodKey = formatPeriod(date, period);

            if (!groupedData[periodKey])
            {
                groupedData[periodKey] = {
                    pendingSupply: 0,
                    completedSupply: 0,
                    pendingReturn: 0,
                    completedReturn: 0,
                    originalDate: date
                };
            }
            else
            {
                if (date < groupedData[periodKey].originalDate) groupedData[periodKey].originalDate = date;
            }

            const isPending = ['PENDING', 'APPROVED', 'IN_PROGRESS'].includes(request.status);
            const isCompleted = request.status === 'COMPLETED';

            if (request.type === 'SUPPLY_REQUEST')
            {
                if (isPending) groupedData[periodKey].pendingSupply += 1;
                if (isCompleted) groupedData[periodKey].completedSupply += 1;
            }
            else if (request.type === 'RETURN_REQUEST')
            {
                if (isPending) groupedData[periodKey].pendingReturn += 1;
                if (isCompleted) groupedData[periodKey].completedReturn += 1;
            }
        });

        return Object.keys(groupedData)
            .sort((a, b) => (groupedData[a].originalDate.getTime() - groupedData[b].originalDate.getTime()))
            .map(period =>
            {
                const data = groupedData[period];
                const totalPending = data.pendingSupply + data.pendingReturn;
                const totalCompleted = data.completedSupply + data.completedReturn;
                const totalRequests = totalPending + totalCompleted;
                const completionRate = totalRequests > 0 ? (totalCompleted / totalRequests) * 100 : 0;

                return {
                    period,
                    pendingSupply: data.pendingSupply,
                    completedSupply: data.completedSupply,
                    pendingReturn: data.pendingReturn,
                    completedReturn: data.completedReturn,
                    totalPending,
                    totalCompleted,
                    completionRate: Math.round(completionRate * 100) / 100
                };
            });
    };

    const processedData = useMemo(() =>
    {
        if (!storeRequests) return [];

        let filteredRequests = storeRequests;

        if (requestType !== 'ALL') filteredRequests = storeRequests.filter(request => request.type === requestType);

        return processRequestData(filteredRequests);
    }, [storeRequests, period, requestType]);

    useEffect(() => 
    {
        const loadData = async () => 
        {
            setIsLoadingData(true);
            try 
            {
                await fetchRequests();
            }
            catch (error) 
            {
                console.error('Error loading data:', error);
            }
            finally 
            {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, []);
    
    useEffect(() => 
    {
        setChartData(processedData);
    }, [processedData]);

    const CustomTooltip = ({ active, payload, label }: any) =>
    {
        if (active && payload && payload.length) 
        {
            const data = payload[0].payload;
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{`Período: ${label}`}</p>
                    <div className={styles.tooltipContent}>
                        <p style={{ color: '#8884d8' }}>
                            {`Solicitudes Pendientes: ${data.totalPending}`}
                        </p>
                        <p style={{ color: '#82ca9d' }}>
                            {`Solicitudes Completadas: ${data.totalCompleted}`}
                        </p>
                        <div className={styles.tooltipDetails}>
                            <p>{`Abastecimiento Pendiente: ${data.pendingSupply}`}</p>
                            <p>{`Abastecimiento Completado: ${data.completedSupply}`}</p>
                            <p>{`Devolución Pendiente: ${data.pendingReturn}`}</p>
                            <p>{`Devolución Completada: ${data.completedReturn}`}</p>
                        </div>
                        <div className={styles.tooltipRate}>
                            <p>{`Tasa de Completación: ${data.completionRate}%`}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }
    const totalPending = chartData.reduce((sum, item) => sum + item.totalPending, 0);
    const totalCompleted = chartData.reduce((sum, item) => sum + item.totalCompleted, 0);
    const overallCompletionRate = totalPending + totalCompleted > 0
        ? Math.round((totalCompleted / (totalPending + totalCompleted)) * 10000) / 100
        : 0;

    const isLoading = requestLoading || isLoadingData;
    const hasError = requestError;

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <div className={styles.titleSection}>
                    <h3>Solicitudes de Tienda</h3>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            Pendientes: {totalPending}
                        </span>
                        <span className={styles.statItem}>
                            Completadas: {totalCompleted}
                        </span>
                        <span className={styles.statItem}>
                            Tasa Completación: {overallCompletionRate}%
                        </span>
                    </div>
                </div>
                <div className={styles.controls}>
                    <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value as 'ALL' | 'SUPPLY_REQUEST' | 'RETURN_REQUEST')}
                        className={styles.typeSelect}
                    >
                        <option value="ALL">Todos los Tipos</option>
                        <option value="SUPPLY_REQUEST">Solicitudes de Abastecimiento</option>
                        <option value="RETURN_REQUEST">Solicitudes de Devolución</option>
                    </select>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className={styles.periodSelect}
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <p>Cargando datos de solicitudes...</p>
                </div>
            )}

            {hasError && (
                <div className={styles.error}>
                    <p>Error al cargar los datos: {hasError}</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length === 0 && (
                <div className={styles.nodata}>
                    <p>No hay datos de solicitudes disponibles</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        width={500}
                        height={400}
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis
                            dataKey="period"
                            scale="band"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="totalPending"
                            barSize={20}
                            fill="#ff7300"
                            name="Solicitudes Pendientes"
                        />
                        <Bar
                            dataKey="totalCompleted"
                            barSize={20}
                            fill="#82ca9d"
                            name="Solicitudes Completadas"
                        />
                        <Line
                            type="monotone"
                            dataKey="completionRate"
                            stroke="#8884d8"
                            strokeWidth={3}
                            name="Tasa de Completación (%)"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default StoreRequestChart;
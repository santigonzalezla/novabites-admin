'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './userbarchart.module.css';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Rectangle, Bar, CartesianGrid } from 'recharts';
import { CustomOrder, Order, User } from '@/interfaces/interfaces';
import { useFetch } from '@/hooks/useFetch';

interface ChartData {
    userName: string;
    regularSales: number;
    customSales: number;
    totalSales: number;
    orderCount: number;
    customOrderCount: number;
    totalOrders: number;
    userRole: string;
    averageOrder: number;
}

const UserBarChart = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'total' | 'orders' | 'average'>('total');
    const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'MANAGER' | 'ADMIN'>('ALL');
    const { data: users, error: userError, isLoading: usersLoading, execute: fetchUsers } = useFetch<User[]>(`/api/user`, {
        immediate: false,
    });
    const { data: orders, error: orderError, isLoading: ordersLoading, execute: fetchOrders } = useFetch<Order[]>(`/api/order`, {
        immediate: false,
    });
    const { data: customOrders, error: customOrderError, isLoading: customOrderLoading, execute: fetchCustomOrders } = useFetch<CustomOrder[]>(`/api/custom-order`, {
        immediate: false,
    });

    const processUserData = (users: User[], orders: Order[], customOrders: CustomOrder[]) => 
    {
        const userMap = new Map<string, ChartData>();

        users?.forEach(user => {
            userMap.set(user.id, {
                userName: user.name,
                regularSales: 0,
                customSales: 0,
                totalSales: 0,
                orderCount: 0,
                customOrderCount: 0,
                totalOrders: 0,
                userRole: user.role,
                averageOrder: 0
            });
        });

        orders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const userData = userMap.get(order.userId);

                if (userData)
                {
                    const price = parseFloat(order.totalPrice.toString());
                    userData.regularSales += price;
                    userData.totalSales += price;
                    userData.orderCount += 1;
                    userData.totalOrders += 1;
                }
            }
        });

        customOrders?.forEach(order =>
        {
            if (order.status === 'COMPLETED')
            {
                const userData = userMap.get(order.userId);

                if (userData)
                {
                    const price = parseFloat(order.totalPrice.toString());
                    userData.customSales += price;
                    userData.totalSales += price;
                    userData.customOrderCount += 1;
                    userData.totalOrders += 1;
                }
            }
        });

        Array.from(userMap.values()).forEach(userData =>
        {
            userData.averageOrder = userData.totalOrders > 0 ? userData.totalSales / userData.totalOrders : 0;
        });

        return Array.from(userMap.values());
    };

    const processedData = useMemo(() =>
    {
        if (!users || !orders || !customOrders) return [];

        let data = processUserData(users, orders, customOrders);

        if (filterRole !== 'ALL') data = data.filter(user => user.userRole === filterRole);

        data = data.filter(user => user.totalSales > 0);

        return data.sort((a, b) =>
        {
            switch (sortBy)
            {
                case 'name':
                    return a.userName.localeCompare(b.userName);
                case 'orders':
                    return b.totalOrders - a.totalOrders;
                case 'average':
                    return b.averageOrder - a.averageOrder;
                case 'total':
                default:
                    return b.totalSales - a.totalSales;
            }
        }).slice(0, 15);
    }, [users, orders, customOrders, sortBy, filterRole]);

    useEffect(() => 
    {
        const loadData = async () => 
        {
            setIsLoadingData(true);
            
            try 
            {
                await Promise.all([
                    fetchUsers(),
                    fetchOrders(),
                    fetchCustomOrders()
                ]);
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
    
    const formatCurrency = (value: number) => 
    {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => 
    {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{`Vendedor: ${label}`}</p>
                    <p className={styles.tooltipRole}>{`Rol: ${data.userRole}`}</p>
                    <div className={styles.tooltipContent}>
                        {payload.map((entry: any, index: number) => (
                            <p key={index} style={{ color: entry.color }}>
                                {`${entry.name}: ${formatCurrency(entry.value)}`}
                            </p>
                        ))}
                        <div className={styles.tooltipStats}>
                            <p>{`Total Órdenes: ${data.totalOrders}`}</p>
                            <p>{`Órdenes Regulares: ${data.orderCount}`}</p>
                            <p>{`Órdenes Personalizadas: ${data.customOrderCount}`}</p>
                            <p>{`Promedio por Orden: ${formatCurrency(data.averageOrder)}`}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Calcular estadísticas generales
    const totalSales = chartData.reduce((sum: any, item: any) => sum + item.totalSales, 0);
    const topPerformer = chartData.length > 0 ? chartData[0] : null;
    const totalUsers = chartData.length;

    const isLoading = usersLoading || ordersLoading || customOrderLoading || isLoadingData;
    const hasError = userError || orderError || customOrderError;

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <div className={styles.titleSection}>
                    <h3>Performance de Vendedores</h3>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            Vendedores Activos: {totalUsers}
                        </span>
                        <span className={styles.statItem}>
                            Total Ventas: {formatCurrency(totalSales)}
                        </span>
                        {topPerformer && (
                            <span className={styles.statItem}>
                                Top: {topPerformer.userName}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.controls}>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'USER' | 'MANAGER' | 'ADMIN')}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">Todos los Roles</option>
                        <option value="USER">Usuarios</option>
                        <option value="MANAGER">Gerentes</option>
                        <option value="ADMIN">Administradores</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'total' | 'orders' | 'average')}
                        className={styles.sortSelect}
                    >
                        <option value="total">Por Total de Ventas</option>
                        <option value="orders">Por Número de Órdenes</option>
                        <option value="average">Por Promedio por Orden</option>
                        <option value="name">Por Nombre</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <p>Cargando datos de performance...</p>
                </div>
            )}

            {hasError && (
                <div className={styles.error}>
                    <p>Error al cargar los datos: {hasError}</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length === 0 && (
                <div className={styles.nodata}>
                    <p>No hay datos de ventas por usuario disponibles</p>
                </div>
            )}

            {!isLoading && !hasError && chartData.length > 0 && (
                <ResponsiveContainer width={'100%'} height={'100%'}>
                    <BarChart
                        width={500}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="userName"
                            fontSize="11px"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                        />
                        <YAxis
                            fontSize="11px"
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="regularSales"
                            fill="#8884d8"
                            name="Órdenes Regulares"
                            activeBar={<Rectangle fill="#7c7ce8" stroke="#6b6bd9" />}
                        />
                        <Bar
                            dataKey="customSales"
                            fill="#82ca9d"
                            name="Órdenes Personalizadas"
                            activeBar={<Rectangle fill="#7bc97b" stroke="#6bb96b" />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default UserBarChart;
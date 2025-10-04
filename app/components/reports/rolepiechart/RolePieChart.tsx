'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './rolepiechart.module.css';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell } from 'recharts';
import { useFetch } from '@/hooks/useFetch';
import { Store, User } from '@/interfaces/interfaces';
interface RoleData {
    name: string;
    value: number;
    percentage: number;
}

interface StoreTypeData {
    name: string;
    value: number;
    percentage: number;
}

const RolePieChart = () =>
{
    const [roleData, setRoleData] = useState<RoleData[]>([]);
    const [storeTypeData, setStoreTypeData] = useState<StoreTypeData[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const { data: users, error: usersError, isLoading: usersLoading, execute: fetchUsers } = useFetch<User[]>(`/api/user`, {
        immediate: false,
    });
    const { data: stores, error: storesError, isLoading: storesLoading, execute: fetchStores } = useFetch<Store[]>(`/api/store`, {
        immediate: false,
    });

    const roleColors = {
        'ADMIN': '#ff6b6b',
        'MANAGER': '#4ecdc4',
        'USER': '#45b7d1'
    };

    const storeTypeColors = {
        'PRINCIPAL': '#96ceb4',
        'NORMAL': '#ffeaa7',
        'DISTRIBUTION': '#dda0dd'
    };

    const roleLabels = {
        'ADMIN': 'Administradores',
        'MANAGER': 'Gerentes',
        'USER': 'Usuarios'
    };

    const storeTypeLabels = {
        'PRINCIPAL': 'Principal',
        'NORMAL': 'Normal',
        'DISTRIBUTION': 'Distribución'
    };

    const processRoleData = (users: User[]) =>
    {
        const roleCounts = users?.reduce((acc, user) =>
        {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const total = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

        return Object.entries(roleCounts).map(([role, count]) => ({
            name: roleLabels[role as keyof typeof roleLabels] || role,
            value: count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));
    };

    const processStoreTypeData = (stores: Store[]) =>
    {
        const typeCounts = stores?.reduce((acc, store) =>
        {
            acc[store.type] = (acc[store.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);

        return Object.entries(typeCounts).map(([type, count]) => ({
            name: storeTypeLabels[type as keyof typeof storeTypeLabels] || type,
            value: count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));
    };

    const processedRoleData = useMemo(() =>
    {
        if (!users) return [];
        return processRoleData(users);
    }, [users]);

    const processedStoreTypeData = useMemo(() =>
    {
        if (!stores) return [];
        return processStoreTypeData(stores);
    }, [stores]);

    // Cargar datos inicialmente
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                await Promise.all([
                    fetchUsers(),
                    fetchStores()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, []);

    // Actualizar datos procesados
    useEffect(() => {
        setRoleData(processedRoleData);
        setStoreTypeData(processedStoreTypeData);
    }, [processedRoleData, processedStoreTypeData]);

    // Tooltip personalizado para roles
    const RoleTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{data.name}</p>
                    <p className={styles.tooltipValue}>
                        {`Usuarios: ${data.value}`}
                    </p>
                    <p className={styles.tooltipPercentage}>
                        {`Porcentaje: ${data.payload.percentage}%`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Tooltip personalizado para tipos de tienda
    const StoreTypeTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{data.name}</p>
                    <p className={styles.tooltipValue}>
                        {`Tiendas: ${data.value}`}
                    </p>
                    <p className={styles.tooltipPercentage}>
                        {`Porcentaje: ${data.payload.percentage}%`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Renderizar etiquetas personalizadas
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // No mostrar etiquetas para sectores muy pequeños

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const isLoading = usersLoading || storesLoading || isLoadingData;
    const hasError = usersError || storesError;
    const totalUsers = roleData.reduce((sum, item) => sum + item.value, 0);
    const totalStores = storeTypeData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={styles.chart}>
            <div className={styles.charttop}>
                <div className={styles.titleSection}>
                    <h3>Distribución de Roles y Tipos de Tienda</h3>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>
                            Total Usuarios: {totalUsers}
                        </span>
                        <span className={styles.statItem}>
                            Total Tiendas: {totalStores}
                        </span>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <p>Cargando distribución de datos...</p>
                </div>
            )}

            {hasError && (
                <div className={styles.error}>
                    <p>Error al cargar los datos: {hasError}</p>
                </div>
            )}

            {!isLoading && !hasError && (roleData.length === 0 || storeTypeData.length === 0) && (
                <div className={styles.nodata}>
                    <p>No hay datos disponibles para mostrar</p>
                </div>
            )}

            {!isLoading && !hasError && roleData.length > 0 && storeTypeData.length > 0 && (
                <div className={styles.chartsContainer}>
                    {/* Gráfico de Roles */}
                    <div className={styles.chartSection}>
                        <h4 className={styles.chartTitle}>Distribución por Roles</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={Object.values(roleColors)[index % Object.values(roleColors).length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<RoleTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Tipos de Tienda */}
                    <div className={styles.chartSection}>
                        <h4 className={styles.chartTitle}>Distribución por Tipo de Tienda</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={storeTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    dataKey="value"
                                >
                                    {storeTypeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={Object.values(storeTypeColors)[index % Object.values(storeTypeColors).length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<StoreTypeTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RolePieChart;
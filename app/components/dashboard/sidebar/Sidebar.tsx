'use client';

import styles from './sidebar.module.css';
import Image from 'next/image';
import SidebarOption from "@/app/components/dashboard/sidebaroption/SidebarOption";
import {
    ArrowLeft, BarChart, CashClosing,
    CustomOrder,
    Dashboard,
    Inventory,
    Message,
    Order, Request,
    Settings,
    Store,
    Supplier,
    Supplies, Tag, Tags,
    User, Users,
} from '@/app/components/svg';
import {useState} from "react";
import { useTheme } from '@/context/ThemeContext';

const Sidebar = () =>
{
    const { theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () =>
    {
        setIsCollapsed(!isCollapsed);
    }

    const options = [
        { item: 'Resumen', icon: <Dashboard />, link: '/dashboard' },
        { item: 'Inventario', icon: <Inventory />, link: '/dashboard/inventory' },
        { item: 'Insumos', icon: <Supplies />, link: '/dashboard/supplies' },
        { item: 'Ordenes', icon: <Order />, link: '/dashboard/orders' },
        { item: 'Ordenes Personalizadas', icon: <CustomOrder />, link: '/dashboard/customorders' },
        { item: 'Proveedores', icon: <Supplier />, link: '/dashboard/suppliers' },
        { item: 'Clientes', icon: <Users />, link: '/dashboard/clients' },
        { item: 'Cierres de Caja', icon: <CashClosing />, link: '/dashboard/cashclosing' },
        { item: 'Solicitudes', icon: <Request />, link: '/dashboard/requests' },
        { item: 'Reportes', icon: <BarChart />, link: '/dashboard/reports' },
        { item: 'Categorías', icon: <Tag />, link: '/dashboard/categories' },
        { item: 'Subcategorías', icon: <Tags />, link: '/dashboard/subcategories' },
        { item: 'Sucursales', icon: <Store />, link: '/dashboard/stores' },
        { item: 'Mensajes', icon: <Message />, link: '/dashboard/messages' },
        { item: 'Usuarios', icon: <User />, link: '/dashboard/users' },
        { item: 'Configuración', icon: <Settings />, link: '/dashboard/settings' },
    ];

    return (
        <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
            <div className={styles.logo}>
                <Image
                    src={`${theme === 'dark' ? '/logodark.png' : '/logo.png'}`}
                    alt="NovaBites"
                    width={isCollapsed ? 40 : 150}
                    height={isCollapsed ? 40 : 50}
                    style={{ objectFit: "cover" }}
                    priority
                />
            </div>

            <div className={styles.scrollContainer}>
                <div className={styles.options}>
                    <div className={styles.optionGroup}>
                        {!isCollapsed && <div className={styles.groupTitle}>Principal</div>}
                        {options.slice(0, 5).map((option, index) => (
                            <SidebarOption
                                key={index}
                                icon={option.icon}
                                item={option.item}
                                link={option.link}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>

                    <div className={styles.optionGroup}>
                        {!isCollapsed && <div className={styles.groupTitle}>Gestión</div>}
                        {options.slice(5, 12).map((option, index) => (
                            <SidebarOption
                                key={index + 4}
                                icon={option.icon}
                                item={option.item}
                                link={option.link}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>

                    <div className={styles.optionGroup}>
                        {!isCollapsed && <div className={styles.groupTitle}>Sistema</div>}
                        {options.slice(12).map((option, index) => (
                            <SidebarOption
                                key={index + 8}
                                icon={option.icon}
                                item={option.item}
                                link={option.link}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <button
                className={styles.collapseButton}
                onClick={toggleCollapse}
                title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
                <ArrowLeft />
            </button>
        </div>
    );
}

export default Sidebar;
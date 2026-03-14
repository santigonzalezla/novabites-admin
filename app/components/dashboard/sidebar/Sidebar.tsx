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
    X,
} from '@/app/components/svg';
import {useEffect, useMemo, useState} from "react";
import { useTheme } from '@/context/ThemeContext';
import { Role } from '@/interfaces/enums';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar = ({ isMobileOpen = false, onMobileClose }: SidebarProps) =>
{
    const { theme } = useTheme();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Bloquear scroll cuando el sidebar móvil está abierto
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isMobileOpen]);

    const toggleCollapse = () =>
    {
        setIsCollapsed(!isCollapsed);
    }

    const options = [
        // Principal
        { item: 'Resumen', icon: <Dashboard />, link: '/dashboard', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Inventario', icon: <Inventory />, link: '/dashboard/inventory', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Ordenes', icon: <Order />, link: '/dashboard/orders', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Ordenes Personalizadas', icon: <CustomOrder />, link: '/dashboard/customorders', roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER] },
        { item: 'Solicitudes', icon: <Request />, link: '/dashboard/requests', roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER, Role.COURIER] },
        { item: 'Cierres de Caja', icon: <CashClosing />, link: '/dashboard/cashclosing', roles: [Role.ADMIN, Role.MANAGER, Role.MANUFACTURER] },

        // Gestión
        { item: 'Proveedores', icon: <Supplier />, link: '/dashboard/suppliers', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Insumos', icon: <Supplies />, link: '/dashboard/supplies', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Clientes', icon: <Users />, link: '/dashboard/clients', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Reportes', icon: <BarChart />, link: '/dashboard/reports', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Categorías', icon: <Tag />, link: '/dashboard/categories', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Subcategorías', icon: <Tags />, link: '/dashboard/subcategories', roles: [Role.ADMIN, Role.MANAGER] },

        // Sistema
        { item: 'Sucursales', icon: <Store />, link: '/dashboard/stores', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Mensajes', icon: <Message />, link: '/dashboard/messages', roles: [Role.ADMIN, Role.MANAGER] },
        { item: 'Usuarios', icon: <User />, link: '/dashboard/users', roles: [Role.ADMIN] },
        { item: 'Configuración', icon: <Settings />, link: '/dashboard/settings', roles: [Role.ADMIN] },
    ];

    const userOptions = useMemo(() =>
    {
        if (!user || !user.role) return [];

        return options.filter(option => option.roles.includes(user.role as Role));
    }, [user]);

    const groupedOptions = useMemo(() =>
    {
        const principal = userOptions.filter(opt =>
            ['Resumen', 'Inventario',  'Ordenes', 'Ordenes Personalizadas','Solicitudes','Cierres de Caja'].includes(opt.item)
        );

        const management = userOptions.filter(opt =>
            ['Proveedores', 'Insumos', 'Clientes',  'Reportes', 'Categorías', 'Subcategorías'].includes(opt.item)
        );

        const system = userOptions.filter(opt =>
            ['Sucursales', 'Mensajes', 'Usuarios', 'Configuración'].includes(opt.item)
        );

        return { principal, management, system };
    }, [userOptions]);

    return (
        <>
            {/* Overlay para móvil */}
            {isMobile && isMobileOpen && (
                <div className={styles.mobileOverlay} onClick={onMobileClose} />
            )}

            <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isMobile && isMobileOpen ? styles.mobileOpen : ""} ${isMobile && !isMobileOpen ? styles.mobileClosed : ""}`}>
                <div className={styles.logo}>
                    {isMobile && (
                        <button
                            className={styles.mobileCloseButton}
                            onClick={onMobileClose}
                            aria-label="Cerrar menú"
                        >
                            <X />
                        </button>
                    )}
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
                    {groupedOptions.principal.length > 0 && (
                        <div className={styles.optionGroup}>
                            {!isCollapsed && <div className={styles.groupTitle}>Principal</div>}
                            {groupedOptions.principal.map((option, index) => (
                                <SidebarOption
                                    key={`principal-${index}`}
                                    icon={option.icon}
                                    item={option.item}
                                    link={option.link}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                    )}

                    {/* Grupo Gestión */}
                    {groupedOptions.management.length > 0 && (
                        <div className={styles.optionGroup}>
                            {!isCollapsed && <div className={styles.groupTitle}>Gestión</div>}
                            {groupedOptions.management.map((option, index) => (
                                <SidebarOption
                                    key={`gestion-${index}`}
                                    icon={option.icon}
                                    item={option.item}
                                    link={option.link}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                    )}

                    {groupedOptions.system.length > 0 && (
                        <div className={styles.optionGroup}>
                            {!isCollapsed && <div className={styles.groupTitle}>Sistema</div>}
                            {groupedOptions.system.map((option, index) => (
                                <SidebarOption
                                    key={`sistema-${index}`}
                                    icon={option.icon}
                                    item={option.item}
                                    link={option.link}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!isMobile && (
                <button
                    className={styles.collapseButton}
                    onClick={toggleCollapse}
                    title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                >
                    <ArrowLeft />
                </button>
            )}
        </div>
        </>
    );
}

export default Sidebar;
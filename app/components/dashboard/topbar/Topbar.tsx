'use client';

import styles from "./topbar.module.css";
import { usePathname } from "next/navigation";
import { useTheme } from '@/context/ThemeContext';
import { Bell, Moon, Sun, PanelOpen } from '@/app/components/svg';
import UserDropdown from '@/app/components/dashboard/userdropdown/UserDropdown';
import { useState } from 'react';
import NotificationPanel from '@/app/components/shared/notificationpanel/NotificationPanel';
import { useNotifications } from '@/context/NotificationContext';

interface TopbarProps {
    onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) =>
{
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const pathname = usePathname();
    let text: string;
    const [isPanelOpen, setIsPanelOpen] =  useState(false);

    switch (pathname.split('/')[2])
    {
        case undefined:
            text = 'Resumen';
            break;
        case 'inventory':
            text = 'Inventario';
            break;
        case 'supplies':
            text = 'Insumos';
            break;
        case 'orders':
            text = 'Ordenes';
            break;
        case 'customorders':
            text = 'Ordenes Personalizadas';
            break;
        case 'suppliers':
            text = 'Proveedores';
            break;
        case 'reports':
            text = 'Reportes';
            break;
        case 'categories':
            text = 'Categorías';
            break;
        case 'subcategories':
            text = 'Subcategorías';
            break;
        case 'stores':
            text = 'Sucursales';
            break;
        case 'clients':
            text = 'Clientes';
            break;
        case 'cashclosing':
            text = 'Cierres de Caja';
            break;
        case 'requests':
            text = 'Solicitudes';
            break;
        case 'messages':
            text = 'Mensajes';
            break;
        case 'users':
            text = 'Usuarios';
            break;
        case 'settings':
            text = 'Configuración';
            break;
        default:
            text = 'Dashboard';
            break;
    }

    const togglePanel = () => setIsPanelOpen(!isPanelOpen);

    const closePanel = () => setIsPanelOpen(false);

    return (
        <div className={styles.top}>
            <div className={styles.topleft}>
                <button
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    <PanelOpen />
                </button>
                <h1>{text}</h1>
            </div>
            <div className={styles.topright}>
                <div
                    className={styles.topbell}
                    onClick={togglePanel}
                    style={{ cursor: 'pointer' }}
                >
                    <Bell />
                    {unreadCount > 0 && (
                        <span className={styles.notificationCount}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                    )}
                </div>
                <button
                    onClick={toggleTheme}
                    className={styles.themeToggle}
                    title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon /> : <Sun />}
                </button>

                <UserDropdown />

                <NotificationPanel isOpen={isPanelOpen} onClose={closePanel} />
            </div>
        </div>
    );
}

export default Topbar;
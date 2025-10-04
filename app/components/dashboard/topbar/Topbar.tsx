'use client';

import styles from "./topbar.module.css";
import { usePathname } from "next/navigation";
import { useTheme } from '@/context/ThemeContext';
import { Bell, Moon, Sun } from '@/app/components/svg';
import UserDropdown from '@/app/components/dashboard/userdropdown/UserDropdown';

const Topbar = () =>
{
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    let text: string;

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
        case 'stores':
            text = 'Sucursales';
            break;
        case 'clients':
            text = 'Clientes';
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
        default:
            text = 'Dashboard'; // Valor por defecto si no coincide ninguna ruta
            break;
    }

    return (
        <div className={styles.top}>
            <h1>{text}</h1>
            <div className={styles.topright}>
                <div className={styles.topbell}>
                    <Bell />
                    <span className={styles.notificationCount}>3</span>
                </div>
                <button
                    onClick={toggleTheme}
                    className={styles.themeToggle}
                    title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
                >
                    {theme === "light" ? <Moon /> : <Sun />}
                </button>

                <UserDropdown />
            </div>
        </div>
    );
}

export default Topbar;
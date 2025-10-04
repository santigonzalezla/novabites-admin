"use client"

import React from 'react';
import styles from '../page.module.css';
import { Save, Bell, Shield } from '@/app/components/svg';

interface AppSettings {
    appName: string;
    appVersion: string;
    theme: string;
    language: string;
    notifications: boolean;
    autoBackup: boolean;
    sessionTimeout: string;
}

interface AppTabProps {
    appSettings: AppSettings;
    setAppSettings: (settings: AppSettings) => void;
    handleSave: () => void;
}

const AppTab: React.FC<AppTabProps> = ({ appSettings, setAppSettings, handleSave }) =>
{
    return (
        <div className={styles.appSection}>
            <div className={styles.sectionTitle}>
                <h2>Configuración de la Aplicación</h2>
                <button className={styles.saveButton} onClick={handleSave}>
                    <Save />
                    Guardar Cambios
                </button>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Nombre de la Aplicación</label>
                    <input
                        type="text"
                        value={appSettings.appName}
                        onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Versión</label>
                    <input type="text" value={appSettings.appVersion} disabled />
                </div>
                <div className={styles.formGroup}>
                    <label>Tema</label>
                    <select
                        value={appSettings.theme}
                        onChange={(e) => setAppSettings({ ...appSettings, theme: e.target.value })}
                    >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="auto">Automático</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Idioma</label>
                    <select
                        value={appSettings.language}
                        onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Tiempo de Sesión (minutos)</label>
                    <input
                        type="number"
                        value={appSettings.sessionTimeout}
                        onChange={(e) => setAppSettings({ ...appSettings, sessionTimeout: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.toggleSection}>
                <div className={styles.toggleGroup}>
                    <div className={styles.toggleInfo}>
                        <Bell />
                        <div>
                            <h4>Notificaciones</h4>
                            <p>Recibir notificaciones de la aplicación</p>
                        </div>
                    </div>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={appSettings.notifications}
                            onChange={(e) => setAppSettings({ ...appSettings, notifications: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.toggleGroup}>
                    <div className={styles.toggleInfo}>
                        <Shield />
                        <div>
                            <h4>Respaldo Automático</h4>
                            <p>Crear respaldos automáticos de los datos</p>
                        </div>
                    </div>
                    <label className={styles.toggle}>
                        <input
                            type="checkbox"
                            checked={appSettings.autoBackup}
                            onChange={(e) => setAppSettings({ ...appSettings, autoBackup: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AppTab;
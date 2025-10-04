"use client"

import React from 'react';
import styles from '../page.module.css';
import { Save, Lock, Shield, User as UserIcon } from '@/app/components/svg';

interface SecurityTabProps {
    handleSave: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ handleSave }) =>
{
    return (
        <div className={styles.securitySection}>
            <div className={styles.sectionTitle}>
                <h2>Configuración de Seguridad</h2>
                <button className={styles.saveButton} onClick={handleSave}>
                    <Save />
                    Guardar Cambios
                </button>
            </div>

            <div className={styles.securityCard}>
                <Lock />
                <div>
                    <h3>Cambiar Contraseña</h3>
                    <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
                    <button className={styles.securityButton}>Cambiar Contraseña</button>
                </div>
            </div>

            <div className={styles.securityCard}>
                <Shield />
                <div>
                    <h3>Autenticación de Dos Factores</h3>
                    <p>Agrega una capa extra de seguridad a tu cuenta</p>
                    <button className={styles.securityButton}>Configurar 2FA</button>
                </div>
            </div>

            <div className={styles.securityCard}>
                <UserIcon />
                <div>
                    <h3>Sesiones Activas</h3>
                    <p>Revisa y gestiona las sesiones activas en tu cuenta</p>
                    <button className={styles.securityButton}>Ver Sesiones</button>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;
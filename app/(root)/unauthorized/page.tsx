'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';
import { Shield, ArrowLeft, Dashboard } from '@/app/components/svg';

const Unauthorized = () =>
{
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleGoBack = () => router.back();
    const handleGoHome = () => router.push('/dashboard');
    const handleLogout = () => logout();

    return (
        <div className={styles.unauthorized}>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                    <div className={styles.iconCircle}><Shield /></div>
                </div>
                <div className={styles.errorCode}>403</div>
                <h1 className={styles.title}>Acceso Denegado</h1>
                <p className={styles.message}>Lo sentimos, no tienes los permisos necesarios para acceder a esta página.</p>
                {user && (
                    <div className={styles.userInfo}>
                        <p className={styles.userText}>
                            <strong>Usuario:</strong> {user.name}
                        </p>
                        <p className={styles.userText}>
                            <strong>Rol:</strong> {user.role}
                        </p>
                    </div>
                )}
                <div className={styles.actions}>
                    <button
                        className={styles.secondaryButton}
                        onClick={handleGoBack}
                    >
                        <ArrowLeft />
                        Volver Atrás
                    </button>

                    <button
                        className={styles.primaryButton}
                        onClick={handleGoHome}
                    >
                        <Dashboard />
                        Ir al Inicio
                    </button>
                </div>

                <div className={styles.logoutSection}>
                    <p className={styles.logoutText}>
                        ¿Necesitas acceder con otra cuenta?
                    </p>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </button>
                </div>
                <div className={styles.infoBox}>
                    <p className={styles.infoTitle}>¿Por qué veo este mensaje?</p>
                    <ul className={styles.infoList}>
                        <li>No tienes los permisos necesarios para esta sección</li>
                        <li>Tu rol actual no permite acceder a este recurso</li>
                        <li>Esta página está restringida a ciertos usuarios</li>
                    </ul>
                </div>
                <div className={styles.contact}>
                    <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
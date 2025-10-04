'use client';

import styles from './loginform.module.css';
import { satoshi } from "@/app/fonts/satoshi";
import Link from "next/link";
import { FormEvent, useState } from 'react';
import { useLogin } from '@/hooks/useFetch';
import { toast } from 'sonner';

const SignInForm = () =>
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { loginUser, isLoading, error } = useLogin();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        if (!username || !password) {
            console.error("Username y password son requeridos");
            return;
        }

        const success = await loginUser(username, password);

        (success)
            ? toast.success("Inicio de Sesión exitoso!", {
                description: "Bienvenido de nuevo!",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            })
            : toast.error(error || "Error al iniciar sesión. Revisa tus credenciales.", {
                description: "Inténtalo de nuevo.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
    }

    return (
        <form className={`${satoshi.variable} ${styles.form}`} onSubmit={handleSubmit}>
            <div className={styles.top}>
                <h1>Accede a tu cuenta</h1>
            </div>
            <div className={styles.container}>
                <div className={styles.socials}>
                </div>
                <div className={styles.input}>
                    <label htmlFor="username" className={styles.label}>Username</label>
                    <input
                        type="email"
                        name="username"
                        id="username"
                        placeholder="test@test.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.input}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        minLength={6}
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.checkboxContainer}>
                    <div>
                        <input
                            id="remember"
                            type="checkbox"
                            className={styles.checkbox}
                        />
                        <label htmlFor="remember" className={styles.rememberLabel}>Recuerdame</label>
                    </div>
                    <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
                </div>
                <button type="submit" className={`${satoshi.variable} antialiased ${styles.formbutton}`} disabled={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                <p className={styles.signUpText}>
                    ¿Aún no tienes cuenta? <Link href={"/signup"} className={styles.signUpLink}>Regístrate</Link>
                </p>
            </div>
        </form>
    );
};

export default SignInForm;


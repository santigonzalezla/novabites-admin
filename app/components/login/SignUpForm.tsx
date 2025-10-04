import styles from './loginform.module.css';
import {satoshi} from "@/app/fonts/satoshi";
import Link from "next/link";
import SignWithGoogle from '@/app/components/login/signingoogle/SignWithGoogle';

const SignUpForm = () =>
{
    return (
        <form className={`${satoshi.variable} ${styles.form}`}>
            <div className={styles.top}>
                <h1>Crea tu cuenta</h1>
            </div>
            <div className={styles.container}>
                <div className={styles.socials}>
                    <SignWithGoogle text={"Registrate con Google"}/>
                </div>
                <div className={styles.input}>
                    <label htmlFor="name" className={styles.label}>Nombre</label>
                    <input
                        type="name"
                        name="name"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className={styles.input}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="user@user.com"
                        required
                    />
                </div>
                <div className={styles.input}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        minLength={6}
                        placeholder="*****"
                    />
                </div>
                <button type="submit" className={`${satoshi.variable} antialiased ${styles.formbutton}`}>
                    Regístrate
                </button>
                <p className={styles.signUpText}>
                    ¿Ya tienes una cuenta? <Link href={"/signin"} className={styles.signUpLink}>Accede a tu
                    cuenta</Link>
                </p>
            </div>
        </form>
    );
};

export default SignUpForm;
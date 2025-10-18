import styles from './page.module.css';
import React from "react";
import Image from 'next/image';
import SignInForm from '@/app/components/login/SignInForm';
import ForgotForm from '@/app/components/login/ForgotForm';

const SignInPage = () =>
{
    return (
        <div className={styles.login}>
            <div className={styles.navbar}>
                <Image
                    src="/logo.png"
                    alt={"Logo"}
                    width={200}
                    height={70}
                    style={{objectFit: "cover"}}
                    priority
                />
            </div>
            <div className={styles.container}>
                <ForgotForm />
            </div>
        </div>
    );
}

export default SignInPage;
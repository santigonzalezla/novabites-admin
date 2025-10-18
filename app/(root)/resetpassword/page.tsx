import styles from './page.module.css';
import React from "react";
import Image from 'next/image';
import ResetPasswordForm from '@/app/components/login/ResetPasswordForm';

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
                <ResetPasswordForm />
            </div>
        </div>
    );
}

export default SignInPage;
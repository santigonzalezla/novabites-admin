'use client';

import Image from 'next/image';
import styles from './page.module.css';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Home: React.FC = () =>
{
    const { isAuthenticated } = useAuth();

    return (
        <div className={styles.intro}>
            <div className={styles.navbar}>
                <Image
                    src="/logo.png"
                    alt={"Logo"}
                    width={200}
                    height={70}
                    style={{objectFit: "cover", position: "absolute", top: 50, left: 50}}
                    priority
                />
            </div>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h1>Bienvenido a San Nicolas, empieza a gestionar la Panadería.</h1>
                    {isAuthenticated ? (
                        <Link href={'/dashboard'}>
                            <span>Crea tus proyectos!</span>
                        </Link>
                    ) : (
                        <Link href={'/signin'}>
                            <span>Inicia Sesion</span>
                        </Link>
                    )}
                </div>
                <div className={styles.right}>
                    <Image
                        src={'/bglogin.png'}
                        width={500}
                        height={50}
                        style={{ objectFit: 'cover' }}
                        alt={'bg'}
                        priority
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
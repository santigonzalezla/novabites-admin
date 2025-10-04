import './dashboard.css';
import type {Metadata} from "next";
import {satoshi} from "@/app/fonts/satoshi";
import {APP_DESCRIPTION, APP_NAME, SERVER_URL} from "@/lib/constants";
import Sidebar from "@/app/components/dashboard/sidebar/Sidebar";
import Topbar from "@/app/components/dashboard/topbar/Topbar";
import { ThemeProvider } from '@/context/ThemeContext';
import { Suspense } from 'react';
import { Role } from '@/interfaces/enums';
import AuthGuard from '@/guards/AuthGuard';

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode;}>)
{
    return (
        <div className={`${satoshi.variable} antialiased fulldashboard`}>
            <ThemeProvider>
                <Suspense fallback={null}>
                    <AuthGuard allowedRoles={[Role.ADMIN, Role.MANAGER]}>
                        <Sidebar/>
                        <div className="dashcontainer">
                            <Topbar/>
                            {children}
                        </div>
                    </AuthGuard>
                </Suspense>
            </ThemeProvider>
        </div>
    );
}
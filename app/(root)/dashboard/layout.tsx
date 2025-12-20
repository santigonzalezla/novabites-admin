'use client';

import './dashboard.css';
import {satoshi} from "@/app/fonts/satoshi";
import Sidebar from "@/app/components/dashboard/sidebar/Sidebar";
import Topbar from "@/app/components/dashboard/topbar/Topbar";
import { ThemeProvider } from '@/context/ThemeContext';
import { Suspense, useState } from 'react';
import { Role } from '@/interfaces/enums';
import AuthGuard from '@/guards/AuthGuard';

export default function RootLayout({children}: Readonly<{ children: React.ReactNode;}>)
{
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuClick = () => {
        setIsSidebarOpen(true);
    };

    const handleSidebarClose = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className={`${satoshi.variable} antialiased fulldashboard`}>
            <ThemeProvider>
                <Suspense fallback={null}>
                    <AuthGuard allowedRoles={[Role.ADMIN, Role.MANAGER, Role.COURIER, Role.MANUFACTURER]}>
                        <Sidebar
                            isMobileOpen={isSidebarOpen}
                            onMobileClose={handleSidebarClose}
                        />
                        <div className="dashcontainer">
                            <Topbar onMenuClick={handleMenuClick} />
                            {children}
                        </div>
                    </AuthGuard>
                </Suspense>
            </ThemeProvider>
        </div>
    );
}
import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

interface BaseLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, showSidebar = true }) => {
    if (!showSidebar) return <>{children}</>;

    return (
        <div className="flex h-screen bg-white">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="flex-1 overflow-auto bg-[#fafafa]">
                {children}
            </main>
        </div>
    );
};

export default BaseLayout;

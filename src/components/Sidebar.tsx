import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Image as ImageIcon,
    Layers,
    Video,
    Library,
    Settings,
    LogOut
} from 'lucide-react';
import { khaleej_times_logo } from '../assets';

const Sidebar: React.FC = () => {
    const menuItems = [
        { icon: ImageIcon, label: 'Image Posts', path: '/generate' },
        { icon: Layers, label: 'Carousel Posts', path: '/carousel' },
        { icon: Video, label: 'Motion Poster', path: '/motion' },
        // { icon: Library, label: 'Library', path: '/library' },
    ];

    return (
        <div className="w-92 h-screen bg-white border-r border-gray-100 flex flex-col">
            <div className="p-6">
                <div className="flex flex-col items-center">
                    <img src={khaleej_times_logo} alt="Khaleej Times" className="w-60 object-contain mb-4" />
                    <div className="bg-[#9c9c9c] text-white text-[9px] px-3 py-2 rounded-lg font-bold uppercase tracking-wider">
                        AI-Powered Social Publishing Engine
                    </div>
                </div>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-gray-100 text-black font-semibold'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto px-4 pb-6 space-y-2">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                            ? 'bg-gray-100 text-black font-semibold'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                    }
                >
                    <Settings size={20} />
                    <span className="text-sm">Settings</span>
                </NavLink>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={20} />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

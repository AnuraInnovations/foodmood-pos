import HomeIcon from "@/components/icons/SidebarNav/StoreIcon";
import HorizontalLogo from "@/components/icons/SidebarNav/HorizontalLogo";
import InventoryIcon from "@/components/icons/SidebarNav/InventoryIcon";
import SalesIcon from "@/components/icons/SidebarNav/SalesIcon";
import LogsIcon from "@/components/icons/SidebarNav/LogsIcon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import SettingsIcon from "./icons/SidebarNav/SettingsIcon";
import LogoutIcon from "./icons/SidebarNav/LogoutIcon";
import LogoIcon from "@/app/(main)/store/icons/LogoIcon";
import DiscountsIcon from "./icons/SidebarNav/DiscountsIcon";

export default function SidebarNav() {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const navItems = [
        {
            href: "/store",
            label: "Store",
            icon: HomeIcon,
        },
        {
            href: "/inventory", 
            label: "Inventory",
            icon: InventoryIcon,
        },
        {
            href: "/sales",
            label: "Sales",
            icon: SalesIcon,
        },
        {
            href: "/discounts",
            label: "Discounts",
            icon: DiscountsIcon,
        },
        {
            href: "/logs",
            label: "Logs",
            icon: LogsIcon,
        },
        {
            href: "/settings",
            label: "Settings",
            icon: SettingsIcon,
        },
    ];
        
    const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
        await logout();
        router.push('/login');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        setIsLoggingOut(false);
    }
    };
    
    return (
        // Sidebar container
        <div className="h-full w-[0px] sm:w-[0px] md:w-[80px] lg:w-[200px] bg-[var(--primary)] border-r border-gray-200 duration-400">
            <div className="flex flex-col h-full">
         
                {/* Logo */}
                <div className="flex items-center border-b border-gray-200 bg-[var(--accent)] h-[60px] p-0 md:px-6">
                    <HorizontalLogo className="invisible w-0 lg:visible lg:w-auto opacity-0 lg:opacity-100 transition-all"/>
                    <LogoIcon className="visible w-auto lg:invisible lg:w-0 opacity-100 lg:opacity-0 transition-all" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-[8px]">
                    <ul className="space-y-[8px]">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                            <li key={item.href}>
                                <Link 
                                    href={item.href}
                                    className={`flex h-10 items-center text-[12px] font-semibold ${
                                        isActive 
                                            ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--primary)] text-shadow-lg'
                                            : 'bg-[var(--primary)] hover:bg-[var(--accent)]/50 text-[var(--secondary)]'
                                    }`}
                                >
                                    <div className="w-full flex items-center justify-center lg:justify-start">
                                        <IconComponent className={`w-8 h-8 mx-3 gap-3 ${isActive ? "text-[var(--primary)] drop-shadow-lg" : "text-[var(--secondary)]"} transition-all duration-300`} />
                                        <span className="invisible w-0 lg:visible lg:w-auto opacity-0 lg:opacity-100 transition-all duration-300">{item.label}</span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                        <li>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex w-full h-10 items-center text-[12px] text-[var(--error)] group hover:text-[var(--primary)] font-semibold bg-[var(--primary)] hover:bg-[var(--error)] cursor-pointer"
                            >
                                <div className="w-full flex items-center justify-center lg:justify-start">
                                    <span className="size-8 mx-3">
                                        <LogoutIcon className="gap-3 text-[var(--error)] group-hover:text-[var(--primary)]" />
                                    </span>
                                    <span className="invisible w-0 lg:visible lg:w-auto opacity-0 lg:opacity-100">
                                        {"Logout"}
                                    </span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </nav>
                
            </div>
        </div>
    )
}
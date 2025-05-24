// src/components/dashboard/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ListMusic,
  Package,
  Layers,
  Settings,
  LogOut,
  Shield,
  Flag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Импортируем компоненты Sidebar из UI библиотеки
// или создаем собственный компонент, если компоненты недоступны

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed: boolean;
}

const NavItem = ({ icon, label, href, isActive = false, isCollapsed }: NavItemProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} className="w-full block">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`
                w-full justify-${isCollapsed ? "center" : "start"} mb-1
                ${isActive ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-zinc-800/70 text-zinc-400 hover:text-white"}
              `}
            >
              {icon}
              {!isCollapsed && <span className="ml-2">{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`
        ${isCollapsed ? "w-16" : "w-56"} 
        min-h-screen bg-zinc-900/60 backdrop-blur-md border-r border-zinc-800/50
        flex flex-col transition-all duration-300 ease-in-out p-2
        shrink-0 z-10 relative
      `}
    >
      <div className="flex items-center justify-center mt-2 mb-6 px-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-xl w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold">GD</span>
            </div>
            <span className="text-white font-semibold text-lg">GDPS Админ</span>
          </div>
        ) : (
          <div className="bg-blue-600 rounded-xl w-8 h-8 flex items-center justify-center">
            <span className="text-white font-bold">GD</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Дашборд"
          href="/"
          isActive={true}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Users className="h-5 w-5" />}
          label="Пользователи"
          href="/panel/accounts"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Layers className="h-5 w-5" />}
          label="Уровни"
          href="/panel/lists"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<ListMusic className="h-5 w-5" />}
          label="Музыка"
          href="/panel/music"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Package className="h-5 w-5" />}
          label="Паки"
          href="/panel/packs"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Shield className="h-5 w-5" />}
          label="Роли"
          href="/panel/roles"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Flag className="h-5 w-5" />}
          label="Лидерборд"
          href="/panel/leaderboard"
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <NavItem
          icon={<Settings className="h-5 w-5" />}
          label="Настройки"
          href="/settings"
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<LogOut className="h-5 w-5" />}
          label="Выход"
          href="/panel/accounts/exit"
          isCollapsed={isCollapsed}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-8 mt-4 text-zinc-400 hover:text-white hover:bg-zinc-800/70"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
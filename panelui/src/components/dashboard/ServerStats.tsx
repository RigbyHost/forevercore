// src/components/dashboard/ServerStats.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, HardDrive, CpuIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ServerMemory {
  allocatedMemory: number;
  usedMemory: number;
  heapTotal: number;
  heapUsed: number;
  bufferMemory: number;
  machineTotalMemory: number;
}

interface ServerStatsProps {
  isLoading: boolean;
  serverMemory: ServerMemory;
}

const ServerStats: React.FC<ServerStatsProps> = ({ isLoading, serverMemory }) => {
  const memoryUsagePercent = Math.round((serverMemory.usedMemory / serverMemory.allocatedMemory) * 100) || 0;
  const heapUsagePercent = Math.round((serverMemory.heapUsed / serverMemory.heapTotal) * 100) || 0;

  return (
    <>
      <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden relative">
        {/* Эффект свечения на краях карточки */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
        <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-tr from-blue-500/5 via-transparent to-blue-600/5 pointer-events-none"></div>
        
        <CardHeader className="flex flex-row items-center justify-between p-4 relative z-10">
          <CardTitle className="text-white text-lg">Состояние сервера</CardTitle>
          <Activity className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 relative z-10">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              <Skeleton className="h-6 w-full bg-zinc-800" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-2">
                {serverMemory.allocatedMemory > 0 ? "Активен" : "Н/Д"}
              </div>
              <div className="text-zinc-400 mb-1 text-xs">
                Время работы: 3д 6ч 22м
              </div>
              <div className="text-green-500 text-sm flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Работает нормально
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden relative">
        {/* Эффект свечения на краях карточки */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
        <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-tr from-blue-500/5 via-transparent to-blue-600/5 pointer-events-none"></div>
        
        <CardHeader className="flex flex-row items-center justify-between p-4 relative z-10">
          <CardTitle className="text-white text-lg">Память</CardTitle>
          <HardDrive className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 relative z-10">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              <Skeleton className="h-6 w-full bg-zinc-800" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-zinc-400 text-sm">Общая память</div>
                    <div className="text-zinc-200">
                      {serverMemory.usedMemory} МБ / {serverMemory.allocatedMemory || '∞'} МБ
                    </div>
                  </div>
                  <div className={`${
                    memoryUsagePercent > 80 ? '[&_[data-slot=progress-indicator]]:bg-red-500' : 
                    memoryUsagePercent > 60 ? '[&_[data-slot=progress-indicator]]:bg-yellow-500' : '[&_[data-slot=progress-indicator]]:bg-blue-500'
                  }`}>
                    <Progress 
                      value={memoryUsagePercent} 
                      className="h-2 bg-zinc-800" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-zinc-400 text-sm">Использование кучи</div>
                    <div className="text-zinc-200">
                      {serverMemory.heapUsed} МБ / {serverMemory.heapTotal} МБ
                    </div>
                  </div>
                  <div className={`${
                    heapUsagePercent > 80 ? '[&_[data-slot=progress-indicator]]:bg-red-500' : 
                    heapUsagePercent > 60 ? '[&_[data-slot=progress-indicator]]:bg-yellow-500' : '[&_[data-slot=progress-indicator]]:bg-blue-500'
                  }`}>
                    <Progress 
                      value={heapUsagePercent} 
                      className="h-2 bg-zinc-800" 
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden relative">
        {/* Эффект свечения на краях карточки */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
        <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-tr from-blue-500/5 via-transparent to-blue-600/5 pointer-events-none"></div>
        
        <CardHeader className="flex flex-row items-center justify-between p-4 relative z-10">
          <CardTitle className="text-white text-lg">Производительность</CardTitle>
          <CpuIcon className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4 pb-4 relative z-10">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              <Skeleton className="h-6 w-full bg-zinc-800" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-zinc-400 text-sm">Активные запросы</div>
                    <div className="text-zinc-200">12</div>
                  </div>
                  <div className="[&_[data-slot=progress-indicator]]:bg-blue-500">
                    <Progress value={12} max={100} className="h-2 bg-zinc-800" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-zinc-400 text-sm">Обработка (CPU)</div>
                    <div className="text-zinc-200">24%</div>
                  </div>
                  <div className="[&_[data-slot=progress-indicator]]:bg-blue-500">
                    <Progress value={24} className="h-2 bg-zinc-800" />
                  </div>
                </div>
                
                <div className="text-zinc-400 text-xs mt-2">
                  Авто-обновление: 30 секунд
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ServerStats;
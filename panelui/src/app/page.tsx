// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ListMusic,
  Package,
  Layers,
  Settings,
  LogOut,
  Activity,
  BarChart,
  SigmaSquare,
  UserPlus,
  ListTree,
  Shield,
  Flag
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ServerStats from "@/components/dashboard/ServerStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import Sidebar from "@/components/dashboard/SideBar";

// Демо-данные для графиков
const userActivityData = [
  { name: "Янв", value: 400 },
  { name: "Фев", value: 300 },
  { name: "Мар", value: 600 },
  { name: "Апр", value: 800 },
  { name: "Май", value: 700 },
  { name: "Июн", value: 900 },
  { name: "Июл", value: 1100 },
];

const levelUploadData = [
  { name: "Янв", value: 240 },
  { name: "Фев", value: 180 },
  { name: "Мар", value: 320 },
  { name: "Апр", value: 280 },
  { name: "Май", value: 450 },
  { name: "Июн", value: 380 },
  { name: "Июл", value: 520 },
];

export default function Dashboard() {
  const [serverMemory, setServerMemory] = useState({
    allocatedMemory: 0,
    usedMemory: 0,
    heapTotal: 0,
    heapUsed: 0,
    bufferMemory: 0,
    machineTotalMemory: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получение информации о состоянии сервера
    const fetchServerStats = async () => {
      try {
        const response = await fetch('http://localhost:3005/serverlife', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при получении статистики сервера');
        }
        
        const data = await response.json();
        setServerMemory({
          allocatedMemory: data.AllocatedMemory || 0,
          usedMemory: data.UsedMemory || 0,
          heapTotal: data.HeapTotal || 0,
          heapUsed: data.HeapUsed || 0,
          bufferMemory: data.BufferMemory || 0,
          machineTotalMemory: data.MachineTotalMemory || 0
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка:', error);
        setIsLoading(false);
      }
    };

    fetchServerStats();
    
    // Обновление каждые 30 секунд
    const interval = setInterval(fetchServerStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const memoryUsagePercent = Math.round((serverMemory.usedMemory / serverMemory.allocatedMemory) * 100) || 0;
  const heapUsagePercent = Math.round((serverMemory.heapUsed / serverMemory.heapTotal) * 100) || 0;

  return (
    <div className="flex min-h-screen bg-black">
      {/* Фоновое свечение */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-indigo-600/10 blur-3xl rounded-full"></div>
      </div>
      
      {/* Содержимое */}
      <div className="flex w-full">
        <Sidebar />
        
        {/* Основной контент с явным вертикальным скроллом */}
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Панель управления GDPS</h1>
              <p className="text-zinc-400">Добро пожаловать в админ-панель GDPS сервера</p>
            </div>
            
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50">
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="overview">Обзор</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="users">Пользователи</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="levels">Уровни</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="system">Система</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <ServerStats isLoading={isLoading} serverMemory={serverMemory} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="md:col-span-2 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Активность пользователей</CardTitle>
                      <CardDescription>Статистика за последние 7 месяцев</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={userActivityData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#111', 
                              borderColor: '#333',
                              color: '#fff'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#3b82f6' }}
                            activeDot={{ r: 6, fill: '#60a5fa' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <QuickActions />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Добавление уровней</CardTitle>
                      <CardDescription>Статистика за последние 7 месяцев</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={levelUploadData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#111', 
                              borderColor: '#333',
                              color: '#fff'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#60a5fa" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#60a5fa' }}
                            activeDot={{ r: 6, fill: '#93c5fd' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <RecentActivity />
                </div>
                
                {/* Добавляем дополнительный контент для тестирования скролла */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Дополнительная статистика</CardTitle>
                      <CardDescription>Сводка активности на сервере</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">1,245</div>
                          <div className="text-sm text-zinc-400">Всего уровней</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">328</div>
                          <div className="text-sm text-zinc-400">Активных пользователей</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">84</div>
                          <div className="text-sm text-zinc-400">Загрузок за день</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">19</div>
                          <div className="text-sm text-zinc-400">Музыкальных треков</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="mt-4">
                <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Управление пользователями</CardTitle>
                    <CardDescription>Эта вкладка появится в полной версии</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400">Здесь будет располагаться управление учетными записями GDPS</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="levels" className="mt-4">
                <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Управление уровнями</CardTitle>
                    <CardDescription>Эта вкладка появится в полной версии</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400">Здесь будет располагаться управление уровнями GDPS</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="system" className="mt-4">
                <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Системные настройки</CardTitle>
                    <CardDescription>Эта вкладка появится в полной версии</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400">Здесь будет располагаться управление системными настройками GDPS</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <footer className="mt-8 text-center text-zinc-500 text-sm pb-4">
              <p>GDPS Admin Panel &copy; {new Date().getFullYear()}</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
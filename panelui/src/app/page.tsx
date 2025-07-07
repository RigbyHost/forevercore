"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Music, 
  Layers, 
  Settings, 
  Shield, 
  Flag, 
  Package, 
  User, 
  UserCog, 
  Key,
  Trash2,
  ChevronRight,
  Download,
  Upload
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import Sidebar from "@/components/dashboard/SideBar";
import ServerStats from "@/components/dashboard/ServerStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";

// Импорт компонентов управления аккаунтом
import ChangePasswordForm from "@/components/dashboard/ChangePassword";
import ChangeUsernameForm from "@/components/dashboard/ChangeUsername";
import DeleteAccount from "@/components/dashboard/DeleteAccount";

// Импорт компонентов для музыки
import SongList from "@/components/dashboard/MusicorIdk";
import YoutubeUploadForm from "@/components/dashboard/YoutubeUpload";

export default function Dashboard() {
  // Mock data - in a real app this would come from API/server state
  const userName = "Admin";
  const accountID = "1";
  const captchaKey = "demo-key";
  const gdpsName = "GDPS Server";
  const advancedPanel = 1;
  const adminPanel = 1;
  const roleName = "Admin";
  const zemuAvailable = 1;
  const serverMemory = {
    allocatedMemory: 512,
    usedMemory: 256,
    heapTotal: 1024,
    heapUsed: 512,
    bufferMemory: 64,
    machineTotalMemory: 8192,
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [activeAccountTab, setActiveAccountTab] = useState("profile");
  const [activeMusicTab, setActiveMusicTab] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  
  // Демо-данные для графиков

  // Демо-данные для списка музыки
  const demoSongs = [
    { ID: 1, name: "Stereo Madness", authorName: "ForeverMusic", size: "3.5", download: "https://example.com/music/1.mp3" },
    { ID: 2, name: "Back on Track", authorName: "Forever Music [YT]", size: "4.2", download: "https://example.com/music/2.mp3" },
    { ID: 3, name: "Polargeist", authorName: "Forever Music [Dropbox]", size: "2.8", download: "https://example.com/music/3.mp3", originalLink: "https://youtu.be/example" },
    { ID: 4, name: "Dry Out", authorName: "Forever Music [Link]", size: "5.1", download: "https://example.com/music/4.mp3" }
  ];

  // Функция для получения данных о сервере
  const fetchServerStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/serverlife', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при получении статистики сервера');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('Ошибка:', error);
      setIsLoading(false);
      return {};
    }
  };

  useEffect(() => {
    // Загрузка данных при первой отрисовке
    fetchServerStats();
    
    // Обновление каждые 30 секунд
    const interval = setInterval(fetchServerStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Переключение между вкладками аккаунта
  const renderAccountContent = () => {
    switch (activeAccountTab) {
      case "profile":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg col-span-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{userName}</CardTitle>
                      <CardDescription>ID аккаунта: {accountID}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`
                      ${roleName === "Admin" ? "bg-red-600" : 
                        roleName === "Модератор" ? "bg-blue-600" : 
                        roleName === "Разработчик" ? "bg-purple-600" : "bg-green-600"}
                    `}
                  >
                    {roleName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-sm text-zinc-400">Уровней создано</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-sm text-zinc-400">Звезд получено</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-sm text-zinc-400">Демонов пройдено</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-zinc-400">Последний вход: сегодня</div>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white">
                  Обновить статистику
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserCog className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium text-white">Изменение профиля</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Здесь вы можете изменить настройки вашего аккаунта. Имейте в виду, что изменение имени пользователя повлияет на ваш логин в игре.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:border-blue-600 hover:text-blue-400"
                  onClick={() => setActiveAccountTab("username")}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Изменить имя пользователя
                </Button>
                <Button variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:border-blue-600 hover:text-blue-400"
                  onClick={() => setActiveAccountTab("password")}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Изменить пароль
                </Button>
                <Button variant="outline" 
                  className="border-zinc-700 text-red-300 hover:border-red-600 hover:text-red-400"
                  onClick={() => setActiveAccountTab("delete")}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить аккаунт
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium text-white">Права доступа</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Права доступа определяют, какие функции вам доступны в панели управления. Для получения дополнительных прав обратитесь к администратору.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-zinc-300">Уровень доступа</div>
                  <div className="text-sm font-medium text-white">{roleName}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-zinc-300">Панель модератора</div>
                  <Badge variant={advancedPanel ? "default" : "outline"} className={advancedPanel ? "bg-green-600" : "border-zinc-700 text-zinc-400"}>
                    {advancedPanel ? "Доступно" : "Нет доступа"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-zinc-300">Панель администратора</div>
                  <Badge variant={adminPanel ? "default" : "outline"} className={adminPanel ? "bg-green-600" : "border-zinc-700 text-zinc-400"}>
                    {adminPanel ? "Доступно" : "Нет доступа"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );
      case "username":
        return <ChangeUsernameForm currentUsername={userName} />;
      case "password":
        return <ChangePasswordForm accountID={accountID} userName={userName} />;
      case "delete":
        return <DeleteAccount accountID={accountID} userName={userName} captchaKey={captchaKey} />;
      default:
        return null;
    }
  };

  // Переключение между вкладками музыки
  const renderMusicContent = () => {
    switch (activeMusicTab) {
      case "list":
        return <SongList songs={demoSongs} currentPage={0} totalPages={1} />;
      case "youtube":
        return <YoutubeUploadForm captchaKey={captchaKey} />;
      case "newgrounds":
        return (
          <Card className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-xl text-white">Загрузка музыки с Newgrounds</CardTitle>
              </div>
              <CardDescription>
                Загрузите музыку с Newgrounds по ID трека
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">ID песни на Newgrounds</label>
                  <input 
                    type="text" 
                    placeholder="Например: 1234567" 
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white"
                  />
                  <p className="text-xs text-zinc-500">
                    Введите ID песни из URL на Newgrounds (например, из https://www.newgrounds.com/audio/listen/1234567)
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Загрузить музыку
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "zemu":
        return (
          <Card className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-xl text-white">Загрузка музыки с ZeMu</CardTitle>
              </div>
              <CardDescription>
                Загрузите музыку с сервиса ZeMu по ID трека
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">ID песни на ZeMu</label>
                  <input 
                    type="text" 
                    placeholder="Например: 1234567" 
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white"
                  />
                  <p className="text-xs text-zinc-500">
                    Введите ID песни из ZeMu (ZeroniaMusic)
                  </p>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Загрузить музыку
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-2xl font-bold text-white mb-1">Панель управления {gdpsName}</h1>
              <p className="text-zinc-400">Добро пожаловать, {userName}!</p>
            </div>
            
            <Tabs defaultValue="overview" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50">
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="overview">Обзор</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="account">Аккаунт</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-blue-600" value="music">Музыка</TabsTrigger>
                {advancedPanel > 0 && <TabsTrigger className="data-[state=active]:bg-blue-600" value="moderation">Модерация</TabsTrigger>}
                {adminPanel > 0 && <TabsTrigger className="data-[state=active]:bg-blue-600" value="admin">Администрирование</TabsTrigger>}
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
                    <CardContent className="h-64 flex items-center justify-center">
                      <div className="text-zinc-500">
                        [График активности пользователей]
                      </div>
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
                    <CardContent className="h-48 flex items-center justify-center">
                      <div className="text-zinc-500">
                        [График добавления уровней]
                      </div>
                    </CardContent>
                  </Card>
                  
                  <RecentActivity />
                </div>
                
                {/* Дополнительная статистика */}
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
              
              <TabsContent value="account" className="mt-4">
                {activeAccountTab !== "profile" ? (
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-zinc-700 text-zinc-400"
                      onClick={() => setActiveAccountTab("profile")}
                    >
                      <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                      Назад к профилю
                    </Button>
                  </div>
                ) : null}
                
                {renderAccountContent()}
              </TabsContent>
              
              <TabsContent value="music" className="mt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    variant={activeMusicTab === "list" ? "default" : "outline"}
                    className={activeMusicTab === "list" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-700"}
                    onClick={() => setActiveMusicTab("list")}
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Список музыки
                  </Button>
                  <Button 
                    variant={activeMusicTab === "youtube" ? "default" : "outline"}
                    className={activeMusicTab === "youtube" ? "bg-red-600 hover:bg-red-700" : "border-zinc-700"}
                    onClick={() => setActiveMusicTab("youtube")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    YouTube
                  </Button>
                  <Button 
                    variant={activeMusicTab === "newgrounds" ? "default" : "outline"}
                    className={activeMusicTab === "newgrounds" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-700"}
                    onClick={() => setActiveMusicTab("newgrounds")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Newgrounds
                  </Button>
                  {zemuAvailable > 0 && (
                    <Button 
                      variant={activeMusicTab === "zemu" ? "default" : "outline"}
                      className={activeMusicTab === "zemu" ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700"}
                      onClick={() => setActiveMusicTab("zemu")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      ZeMu
                    </Button>
                  )}
                </div>
                
                {renderMusicContent()}
              </TabsContent>
              
              {advancedPanel > 0 && (
                <TabsContent value="moderation" className="mt-4">
                  <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Инструменты модерации</CardTitle>
                      <CardDescription>Управление пользователями и контентом</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Flag className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Управление репортами</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Просмотр и обработка жалоб пользователей на контент
                        </p>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Управление баном</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Блокировка и разблокировка пользователей
                        </p>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Layers className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Оценка уровней</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Присвоение рейтинга пользовательским уровням
                        </p>
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {adminPanel > 0 && (
                <TabsContent value="admin" className="mt-4">
                  <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Панель администратора</CardTitle>
                      <CardDescription>Расширенные инструменты управления сервером</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Shield className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Управление ролями</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Настройка ролей и прав доступа для пользователей
                        </p>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Package className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Управление паками</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Создание и редактирование мап-паков и гаунтлетов
                        </p>
                      </Button>
                      
                      <Button variant="outline" className="h-auto py-4 px-4 border-zinc-700 flex-col items-center justify-start text-left">
                        <div className="flex items-center w-full mb-2">
                          <Settings className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Настройки сервера</span>
                        </div>
                        <p className="text-xs text-zinc-400 text-left">
                          Конфигурация и обслуживание GDPS сервера
                        </p>
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                )}
            </Tabs>
            
            <footer className="mt-8 text-center text-zinc-500 text-sm pb-4">
                <p>GDPS Admin Panel &copy; {new Date().getFullYear()} • Powered by ForeverCore</p>
            </footer>
        </div>
    </main>
    </div>
</div>
);
}
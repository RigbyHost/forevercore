import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { LogOut, User, Music, List, Trophy, Package, ShieldCheck, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("account");

    // Данные пользователя (в реальном приложении будут из API)
    const userData = {
        username: "ДаниИЛ",
        accountID: "14325",
        roleName: "Administrator",
        zemuAvailable: 1,
        advancedPanel: 1,
        adminPanel: 1
    };

    // Обработчик выхода
    const handleLogout = () => {
        // Здесь будет API запрос для выхода
        navigate('/login');
    };

    return (
        <div className="min-h-screen">
            {/* Фоновые элементы */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-10"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"></div>
            </div>

            {/* Шапка */}
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-blue-900/40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold">G</span>
                        </div>
                        <span className="font-bold">GDPS Panel</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Мобильное меню */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-gray-900 border-blue-900/40 p-0">
                                <div className="flex flex-col gap-1 p-4 pt-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                            <span className="text-white font-bold">{userData.username.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold">{userData.username}</p>
                                            <p className="text-sm text-gray-400">ID: {userData.accountID}</p>
                                        </div>
                                    </div>

                                    <Button variant="ghost" onClick={() => navigate("/accounts/changeUsername")}>
                                        Изменить никнейм
                                    </Button>
                                    <Button variant="ghost" onClick={() => navigate("/accounts/changePassword")}>
                                        Изменить пароль
                                    </Button>
                                    <Button variant="ghost" onClick={() => navigate("/accounts/delete")} className="text-red-500">
                                        Удалить аккаунт
                                    </Button>

                                    <div className="h-px bg-blue-900/20 my-2"></div>

                                    <Button variant="ghost" onClick={() => navigate("/music/newgrounds")}>
                                        Добавить из Newgrounds
                                    </Button>
                                    <Button variant="ghost" onClick={() => navigate("/music/link")}>
                                        Добавить по ссылке
                                    </Button>
                                    <Button variant="ghost" onClick={() => navigate("/music/list")}>
                                        Список музыки
                                    </Button>

                                    {(userData.advancedPanel || userData.adminPanel) && (
                                        <>
                                            <div className="h-px bg-blue-900/20 my-2"></div>
                                            <Button variant="ghost" onClick={() => navigate("/lists/reports")}>Репорты</Button>
                                            <Button variant="ghost" onClick={() => navigate("/lists/suggests")}>Suggest-лист</Button>
                                        </>
                                    )}

                                    {userData.adminPanel && (
                                        <>
                                            <div className="h-px bg-blue-900/20 my-2"></div>
                                            <Button variant="ghost" onClick={() => navigate("/packs/mappacks")}>Мап-паки</Button>
                                            <Button variant="ghost" onClick={() => navigate("/roles")}>Управление ролями</Button>
                                        </>
                                    )}

                                    <div className="h-px bg-blue-900/20 my-2"></div>
                                    <Button variant="destructive" onClick={handleLogout}>Выйти</Button>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button variant="destructive" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" /> Выйти
                        </Button>
                    </div>
                </div>
            </header>

            {/* Основной контент */}
            <div className="container max-w-4xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-gray-900/50 border border-blue-900/30 rounded-lg p-4 flex items-center gap-4">
                        <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">{userData.username.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Панель GDPS</h1>
                            <p className="text-gray-400">
                                {userData.username} • ID: {userData.accountID} •
                                {userData.roleName === "Player" ? "Игрок" : userData.roleName}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Навигация по секциям */}
                <div className="overflow-x-auto -mx-4 px-4 mb-4">
                    <div className="flex space-x-2 min-w-max">
                        <Button
                            variant={activeSection === "account" ? "default" : "outline"}
                            onClick={() => setActiveSection("account")}
                            className="border-blue-900/40"
                        >
                            <User className="h-4 w-4 mr-2" />
                            Аккаунт
                        </Button>
                        <Button
                            variant={activeSection === "music" ? "default" : "outline"}
                            onClick={() => setActiveSection("music")}
                            className="border-blue-900/40"
                        >
                            <Music className="h-4 w-4 mr-2" />
                            Музыка
                        </Button>
                        {(userData.advancedPanel || userData.adminPanel) && (
                            <Button
                                variant={activeSection === "lists" ? "default" : "outline"}
                                onClick={() => setActiveSection("lists")}
                                className="border-blue-900/40"
                            >
                                <List className="h-4 w-4 mr-2" />
                                Списки
                            </Button>
                        )}
                        {userData.adminPanel && (
                            <Button
                                variant={activeSection === "admin" ? "default" : "outline"}
                                onClick={() => setActiveSection("admin")}
                                className="border-blue-900/40"
                            >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Админ
                            </Button>
                        )}
                    </div>
                </div>

                {/* Содержимое секций */}
                <div className="bg-gray-900/50 border border-blue-900/30 rounded-lg overflow-hidden">
                    {/* Секция Аккаунт */}
                    {activeSection === "account" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 space-y-2"
                        >
                            <h2 className="text-lg font-medium mb-4">Управление аккаунтом</h2>
                            <Link to="/accounts/changeUsername" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Изменить никнейм
                                </Button>
                            </Link>
                            <Link to="/accounts/changePassword" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Изменить пароль
                                </Button>
                            </Link>
                            <Link to="/accounts/delete" className="block">
                                <Button variant="ghost" className="w-full justify-start text-red-500">
                                    Удалить аккаунт
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Секция Музыка */}
                    {activeSection === "music" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 space-y-2"
                        >
                            <h2 className="text-lg font-medium mb-4">Управление музыкой</h2>
                            <Link to="/music/newgrounds" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Добавить из Newgrounds
                                </Button>
                            </Link>

                            {userData.zemuAvailable && (
                                <Link to="/music/zemu" className="block">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Добавить из ZeMu
                                    </Button>
                                </Link>
                            )}

                            <Link to="/music/link" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Добавить по ссылке
                                </Button>
                            </Link>

                            <Link to="/music/dropbox" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Добавить из Dropbox
                                </Button>
                            </Link>

                            <Link to="/music/youtube" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Добавить из YouTube
                                </Button>
                            </Link>

                            <Link to="/music/list" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Список музыки
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Секция Списки */}
                    {activeSection === "lists" && (userData.advancedPanel || userData.adminPanel) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 space-y-2"
                        >
                            <h2 className="text-lg font-medium mb-4">Управление списками</h2>
                            <Link to="/lists/reports" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Репорты
                                </Button>
                            </Link>

                            <Link to="/lists/suggests" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Suggest-лист
                                </Button>
                            </Link>

                            <Link to="/lists/unlisted" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Unlisted-уровни
                                </Button>
                            </Link>

                            <Link to="/leaderboard/ban" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Бан игроков
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Секция Администрирование */}
                    {activeSection === "admin" && userData.adminPanel && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 space-y-2"
                        >
                            <h2 className="text-lg font-medium mb-4">Администрирование</h2>
                            <Link to="/packs/mappacks" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Мап-паки
                                </Button>
                            </Link>

                            <Link to="/packs/gauntlets" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Гаунтлеты
                                </Button>
                            </Link>

                            <Link to="/roles" className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                    Управление ролями
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Подвал */}
            <footer className="text-center text-gray-500 text-xs p-4 mt-6">
                © 2025 GDPS Panel | Geometry Dash является собственностью RobTop Games
            </footer>
        </div>
    );
}
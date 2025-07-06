import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, 
  Shield, 
  Ban, 
  UserCheck, 
  Search, 
  Crown,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

const moderationSchema = z.object({
  action: z.enum(['ban', 'unban', 'warn', 'promote', 'demote']),
  reason: z.string().min(10, 'Причина должна содержать минимум 10 символов'),
  duration: z.number().optional()
});

interface User {
  accountID: string;
  userName: string;
  email: string;
  isActive: boolean;
  isBanned: boolean;
  role: string;
  registerDate: string;
  lastLoginDate?: string;
  levelsCount: number;
  stars: number;
  coins: number;
  userCoins: number;
  demons: number;
  creatorPoints: number;
}

interface UserManagementProps {
  gdpsName: string;
  adminLevel: number;
}

export default function UserManagement({ gdpsName, adminLevel }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const moderationForm = useForm({
    resolver: zodResolver(moderationSchema),
    defaultValues: {
      action: 'warn' as const,
      reason: '',
      duration: undefined
    }
  });

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        filter
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('Ошибка загрузки пользователей');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Модерация пользователя
  const moderateUser = async (data: z.infer<typeof moderationSchema>) => {
    if (!selectedUser || adminLevel < 2) return;

    try {
      const response = await fetch('/api/admin/moderate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountID: selectedUser.accountID,
          ...data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Действие выполнено успешно');
        loadUsers();
        setSelectedUser(null);
        moderationForm.reset();
      } else {
        toast.error(result.message || 'Ошибка при выполнении действия');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  // Сброс пароля пользователя
  const resetUserPassword = async (accountID: string) => {
    if (adminLevel < 3) {
      toast.error('Недостаточно прав для сброса паролей');
      return;
    }

    if (!confirm('Вы уверены, что хотите сбросить пароль этого пользователя?')) return;

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountID })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Новый пароль: ${result.newPassword}`);
      } else {
        toast.error(result.message || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, filter]);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-500 text-white',
      moderator: 'bg-blue-500 text-white',
      helper: 'bg-green-500 text-white',
      user: 'bg-gray-500 text-white'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge className=\"bg-red-500 text-white\">Заблокирован</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant=\"secondary\">Неактивен</Badge>;
    }
    return <Badge className=\"bg-green-500 text-white\">Активен</Badge>;
  };

  return (
    <div className=\"space-y-6\">
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Users className=\"h-5 w-5\" />
            Управление пользователями
          </CardTitle>
          <CardDescription>
            Просмотр, модерация и управление учетными записями пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Фильтры и поиск */}
          <div className=\"flex flex-col sm:flex-row gap-4 mb-6\">
            <div className=\"flex-1\">
              <div className=\"relative\">
                <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4\" />
                <Input
                  placeholder=\"Поиск пользователей...\"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=\"pl-10\"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className=\"w-[180px]\">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">Все пользователи</SelectItem>
                <SelectItem value=\"active\">Активные</SelectItem>
                <SelectItem value=\"banned\">Заблокированные</SelectItem>
                <SelectItem value=\"admins\">Администраторы</SelectItem>
                <SelectItem value=\"new\">Новые (24ч)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadUsers} disabled={loading}>
              Обновить
            </Button>
          </div>

          {/* Таблица пользователей */}
          <div className=\"rounded-md border\">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Статистика</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.accountID}>
                    <TableCell>
                      <div>
                        <div className=\"font-medium\">{user.userName}</div>
                        <div className=\"text-sm text-gray-500\">{user.email}</div>
                        <div className=\"text-xs text-gray-400\">ID: {user.accountID}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'admin' && <Crown className=\"h-3 w-3 mr-1\" />}
                        {user.role === 'moderator' && <Shield className=\"h-3 w-3 mr-1\" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className=\"text-sm space-y-1\">
                        <div>🏆 {user.stars} звезд</div>
                        <div>👹 {user.demons} демонов</div>
                        <div>🎮 {user.levelsCount} уровней</div>
                        <div>⭐ {user.creatorPoints} CP</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=\"text-sm\">
                        <div>{new Date(user.registerDate).toLocaleDateString()}</div>
                        {user.lastLoginDate && (
                          <div className=\"text-gray-500\">
                            Посл.: {new Date(user.lastLoginDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=\"flex gap-2\">
                        {adminLevel >= 2 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size=\"sm\"
                                variant=\"outline\"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Shield className=\"h-4 w-4\" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Модерация пользователя</DialogTitle>
                                <DialogDescription>
                                  Выберите действие для пользователя \"{user.userName}\"
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...moderationForm}>
                                <form onSubmit={moderationForm.handleSubmit(moderateUser)} className=\"space-y-4\">
                                  <FormField
                                    control={moderationForm.control}
                                    name=\"action\"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Действие</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value=\"warn\">Предупреждение</SelectItem>
                                            <SelectItem value=\"ban\">Заблокировать</SelectItem>
                                            <SelectItem value=\"unban\">Разблокировать</SelectItem>
                                            {adminLevel >= 3 && (
                                              <>
                                                <SelectItem value=\"promote\">Повысить</SelectItem>
                                                <SelectItem value=\"demote\">Понизить</SelectItem>
                                              </>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  {moderationForm.watch('action') === 'ban' && (
                                    <FormField
                                      control={moderationForm.control}
                                      name=\"duration\"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Длительность (дни)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type=\"number\"
                                              placeholder=\"Оставьте пустым для постоянной блокировки\"
                                              {...field}
                                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  <FormField
                                    control={moderationForm.control}
                                    name=\"reason\"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Причина</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder=\"Укажите причину действия...\"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <Button type=\"submit\" className=\"w-full\">
                                    Выполнить действие
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {adminLevel >= 3 && (
                          <Button
                            size=\"sm\"
                            variant=\"outline\"
                            onClick={() => resetUserPassword(user.accountID)}
                          >
                            🔑
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
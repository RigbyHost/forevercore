import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Gamepad2, 
  Star, 
  Trophy, 
  Eye, 
  Trash2, 
  Edit3, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'react-hot-toast';

// Схема для рейтинга уровня
const rateSchema = z.object({
  stars: z.number().min(1).max(10),
  difficulty: z.enum(['auto', 'easy', 'normal', 'hard', 'harder', 'insane', 'demon']),
  featured: z.boolean().default(false),
  epic: z.boolean().default(false)
});

interface Level {
  levelID: string;
  levelName: string;
  description: string;
  username: string;
  downloads: number;
  likes: number;
  stars: number;
  difficulty: string;
  featured: boolean;
  epic: boolean;
  uploadDate: string;
}

interface LevelManagementProps {
  gdpsName: string;
  adminLevel: number;
}

export default function LevelManagement({ gdpsName, adminLevel }: LevelManagementProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const rateForm = useForm({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      stars: 1,
      difficulty: 'normal' as const,
      featured: false,
      epic: false
    }
  });

  // Загрузка уровней
  const loadLevels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        filter,
        page: currentPage.toString()
      });

      const response = await fetch(`/api/admin/levels?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLevels(data.levels);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Ошибка загрузки уровней');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Рейтинг уровня
  const rateLevel = async (data: z.infer<typeof rateSchema>) => {
    if (!selectedLevel || adminLevel < 2) return;

    try {
      const response = await fetch('/api/admin/rate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelID: selectedLevel.levelID,
          ...data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Уровень успешно оценен');
        loadLevels();
        setSelectedLevel(null);
      } else {
        toast.error(result.message || 'Ошибка при оценке уровня');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  // Удаление уровня
  const deleteLevel = async (levelID: string) => {
    if (adminLevel < 3) {
      toast.error('Недостаточно прав для удаления уровней');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить этот уровень?')) return;

    try {
      const response = await fetch('/api/admin/delete-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelID })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Уровень удален');
        loadLevels();
      } else {
        toast.error(result.message || 'Ошибка при удалении уровня');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  useEffect(() => {
    loadLevels();
  }, [searchQuery, filter, currentPage]);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      auto: 'bg-gray-500',
      easy: 'bg-green-500',
      normal: 'bg-blue-500',
      hard: 'bg-yellow-500',
      harder: 'bg-orange-500',
      insane: 'bg-red-500',
      demon: 'bg-purple-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className=\"space-y-6\">
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Gamepad2 className=\"h-5 w-5\" />
            Управление уровнями
          </CardTitle>
          <CardDescription>
            Просмотр, оценка и модерация пользовательских уровней
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Фильтры и поиск */}
          <div className=\"flex flex-col sm:flex-row gap-4 mb-6\">
            <div className=\"flex-1\">
              <div className=\"relative\">
                <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4\" />
                <Input
                  placeholder=\"Поиск уровней...\"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=\"pl-10\"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className=\"w-[180px]\">
                <Filter className=\"h-4 w-4 mr-2\" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">Все уровни</SelectItem>
                <SelectItem value=\"unrated\">Неоцененные</SelectItem>
                <SelectItem value=\"featured\">Рекомендуемые</SelectItem>
                <SelectItem value=\"epic\">Эпические</SelectItem>
                <SelectItem value=\"reported\">С жалобами</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadLevels} disabled={loading}>
              Обновить
            </Button>
          </div>

          {/* Таблица уровней */}
          <div className=\"rounded-md border\">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Сложность</TableHead>
                  <TableHead>Звезды</TableHead>
                  <TableHead>Статистика</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.levelID}>
                    <TableCell className=\"font-medium\">
                      <div>
                        <div>{level.levelName}</div>
                        <div className=\"text-sm text-gray-500 truncate max-w-[200px]\">
                          {level.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{level.username}</TableCell>
                    <TableCell>
                      <Badge className={`${getDifficultyColor(level.difficulty)} text-white`}>
                        {level.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className=\"flex items-center gap-1\">
                        <Star className=\"h-4 w-4 text-yellow-500\" />
                        {level.stars}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=\"text-sm\">
                        <div>👁️ {level.downloads}</div>
                        <div>👍 {level.likes}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=\"flex gap-1\">
                        {level.featured && (
                          <Badge variant=\"secondary\">
                            <Trophy className=\"h-3 w-3 mr-1\" />
                            Рек.
                          </Badge>
                        )}
                        {level.epic && (
                          <Badge className=\"bg-purple-500 text-white\">
                            ⭐ Эпик
                          </Badge>
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
                                onClick={() => setSelectedLevel(level)}
                              >
                                <Star className=\"h-4 w-4\" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Оценить уровень</DialogTitle>
                                <DialogDescription>
                                  Установите рейтинг для уровня \"{level.levelName}\"
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...rateForm}>
                                <form onSubmit={rateForm.handleSubmit(rateLevel)} className=\"space-y-4\">
                                  <FormField
                                    control={rateForm.control}
                                    name=\"stars\"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Количество звезд</FormLabel>
                                        <FormControl>
                                          <Input
                                            type=\"number\"
                                            min={1}
                                            max={10}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={rateForm.control}
                                    name=\"difficulty\"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Сложность</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value=\"auto\">Авто</SelectItem>
                                            <SelectItem value=\"easy\">Легко</SelectItem>
                                            <SelectItem value=\"normal\">Нормально</SelectItem>
                                            <SelectItem value=\"hard\">Сложно</SelectItem>
                                            <SelectItem value=\"harder\">Сложнее</SelectItem>
                                            <SelectItem value=\"insane\">Безумно</SelectItem>
                                            <SelectItem value=\"demon\">Демон</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                  <div className=\"flex gap-4\">
                                    <FormField
                                      control={rateForm.control}
                                      name=\"featured\"
                                      render={({ field }) => (
                                        <FormItem className=\"flex items-center space-x-2\">
                                          <input
                                            type=\"checkbox\"
                                            checked={field.value}
                                            onChange={field.onChange}
                                          />
                                          <FormLabel>Рекомендуемый</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={rateForm.control}
                                      name=\"epic\"
                                      render={({ field }) => (
                                        <FormItem className=\"flex items-center space-x-2\">
                                          <input
                                            type=\"checkbox\"
                                            checked={field.value}
                                            onChange={field.onChange}
                                          />
                                          <FormLabel>Эпический</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button type=\"submit\" className=\"w-full\">
                                    Применить рейтинг
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        )}
                        {adminLevel >= 3 && (
                          <Button
                            size=\"sm\"
                            variant=\"destructive\"
                            onClick={() => deleteLevel(level.levelID)}
                          >
                            <Trash2 className=\"h-4 w-4\" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          <div className=\"flex items-center justify-between mt-4\">
            <div className=\"text-sm text-gray-500\">
              Страница {currentPage} из {totalPages}
            </div>
            <div className=\"flex gap-2\">
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className=\"h-4 w-4\" />
                Назад
              </Button>
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Вперед
                <ChevronRight className=\"h-4 w-4\" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
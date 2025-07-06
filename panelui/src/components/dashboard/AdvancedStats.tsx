import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Music, 
  MessageSquare,
  Activity,
  Server,
  Database,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServerStats {
  users: {
    total: number;
    active24h: number;
    registered24h: number;
    banned: number;
  };
  levels: {
    total: number;
    rated: number;
    featured: number;
    uploaded24h: number;
  };
  songs: {
    total: number;
    uploaded24h: number;
    totalSize: string;
  };
  comments: {
    total: number;
    posted24h: number;
  };
  server: {
    uptime: string;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    dbConnections: number;
    requestsPerMinute: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

interface AdvancedStatsProps {
  gdpsName: string;
}

export default function AdvancedStats({ gdpsName }: AdvancedStatsProps) {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className=\"grid gap-6 md:grid-cols-2 lg:grid-cols-4\">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className=\"animate-pulse\">
              <div className=\"h-4 bg-gray-200 rounded w-3/4\"></div>
              <div className=\"h-8 bg-gray-200 rounded w-1/2\"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const getUsageColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className=\"space-y-6\">
      {/* Основная статистика */}
      <div className=\"grid gap-6 md:grid-cols-2 lg:grid-cols-4\">
        <Card>
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium\">Пользователи</CardTitle>
            <Users className=\"h-4 w-4 text-muted-foreground\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{stats.users.total.toLocaleString()}</div>
            <div className=\"flex justify-between text-xs text-muted-foreground mt-2\">
              <span>Активные: {stats.users.active24h}</span>
              <span>Новые: +{stats.users.registered24h}</span>
            </div>
            {stats.users.banned > 0 && (
              <Badge variant=\"destructive\" className=\"mt-2 text-xs\">
                {stats.users.banned} заблокированных
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium\">Уровни</CardTitle>
            <Gamepad2 className=\"h-4 w-4 text-muted-foreground\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{stats.levels.total.toLocaleString()}</div>
            <div className=\"flex justify-between text-xs text-muted-foreground mt-2\">
              <span>Оценено: {stats.levels.rated}</span>
              <span>Рек.: {stats.levels.featured}</span>
            </div>
            <div className=\"text-xs text-green-600 mt-1\">
              +{stats.levels.uploaded24h} за 24ч
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium\">Музыка</CardTitle>
            <Music className=\"h-4 w-4 text-muted-foreground\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{stats.songs.total.toLocaleString()}</div>
            <div className=\"text-xs text-muted-foreground mt-2\">
              Размер: {stats.songs.totalSize}
            </div>
            <div className=\"text-xs text-green-600 mt-1\">
              +{stats.songs.uploaded24h} за 24ч
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium\">Комментарии</CardTitle>
            <MessageSquare className=\"h-4 w-4 text-muted-foreground\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{stats.comments.total.toLocaleString()}</div>
            <div className=\"text-xs text-green-600 mt-2\">
              +{stats.comments.posted24h} за 24ч
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue=\"server\" className=\"space-y-4\">
        <TabsList>
          <TabsTrigger value=\"server\">Сервер</TabsTrigger>
          <TabsTrigger value=\"performance\">Производительность</TabsTrigger>
          <TabsTrigger value=\"trends\">Тренды</TabsTrigger>
        </TabsList>

        <TabsContent value=\"server\" className=\"space-y-4\">
          <div className=\"grid gap-6 md:grid-cols-2\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Server className=\"h-5 w-5\" />
                  Состояние сервера
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-4\">
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm font-medium\">Время работы</span>
                  <Badge variant=\"outline\">{stats.server.uptime}</Badge>
                </div>
                
                <div className=\"space-y-2\">
                  <div className=\"flex items-center justify-between text-sm\">
                    <span>Использование ОЗУ</span>
                    <span>{stats.server.memoryUsage}%</span>
                  </div>
                  <Progress 
                    value={stats.server.memoryUsage} 
                    className={`h-2 ${getUsageColor(stats.server.memoryUsage)}`}
                  />
                </div>

                <div className=\"space-y-2\">
                  <div className=\"flex items-center justify-between text-sm\">
                    <span>Загрузка CPU</span>
                    <span>{stats.server.cpuUsage}%</span>
                  </div>
                  <Progress 
                    value={stats.server.cpuUsage} 
                    className={`h-2 ${getUsageColor(stats.server.cpuUsage)}`}
                  />
                </div>

                <div className=\"space-y-2\">
                  <div className=\"flex items-center justify-between text-sm\">
                    <span>Использование диска</span>
                    <span>{stats.server.diskUsage}%</span>
                  </div>
                  <Progress 
                    value={stats.server.diskUsage} 
                    className={`h-2 ${getUsageColor(stats.server.diskUsage)}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Database className=\"h-5 w-5\" />
                  База данных
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-4\">
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm font-medium\">Активные соединения</span>
                  <Badge variant=\"outline\">{stats.server.dbConnections}</Badge>
                </div>

                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm font-medium\">Запросов в минуту</span>
                  <Badge variant=\"outline\">{stats.server.requestsPerMinute}</Badge>
                </div>

                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm font-medium\">Последнее обновление</span>
                  <div className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                    <Clock className=\"h-3 w-3\" />
                    {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"performance\" className=\"space-y-4\">
          <div className=\"grid gap-6 md:grid-cols-3\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Activity className=\"h-5 w-5\" />
                  Время отклика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold\">{stats.performance.avgResponseTime}ms</div>
                <div className=\"text-xs text-muted-foreground mt-2\">
                  Среднее время ответа API
                </div>
                {stats.performance.avgResponseTime > 1000 && (
                  <Badge variant=\"destructive\" className=\"mt-2\">
                    Медленно
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <TrendingUp className=\"h-5 w-5\" />
                  Частота ошибок
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold\">{stats.performance.errorRate}%</div>
                <div className=\"text-xs text-muted-foreground mt-2\">
                  Процент ошибочных запросов
                </div>
                {stats.performance.errorRate > 5 && (
                  <Badge variant=\"destructive\" className=\"mt-2\">
                    Высокая
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <BarChart3 className=\"h-5 w-5\" />
                  Попадания в кеш
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold\">{stats.performance.cacheHitRate}%</div>
                <div className=\"text-xs text-muted-foreground mt-2\">
                  Эффективность кеширования
                </div>
                {stats.performance.cacheHitRate > 80 ? (
                  <Badge className=\"bg-green-500 text-white mt-2\">
                    Отлично
                  </Badge>
                ) : (
                  <Badge variant=\"secondary\" className=\"mt-2\">
                    Можно улучшить
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"trends\" className=\"space-y-4\">
          <Card>
            <CardHeader>
              <CardTitle>Тренды активности</CardTitle>
              <CardDescription>
                Графики и аналитика будут добавлены в следующих версиях
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"text-center text-muted-foreground py-8\">
                📊 Здесь будут отображаться графики активности пользователей, 
                загрузок уровней и других метрик за различные периоды времени.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
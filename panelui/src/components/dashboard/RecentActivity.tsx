import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Star, AlertCircle, Clock } from "lucide-react";

interface ActivityItem {
  id: number;
  type: "user" | "level" | "star" | "report";
  title: string;
  description: string;
  time: string;
}

const activityItems: ActivityItem[] = [
  {
    id: 1,
    type: "level",
    title: "Новый уровень загружен",
    description: "Level X был загружен пользователем Player1",
    time: "10 минут назад"
  },
  {
    id: 2,
    type: "user",
    title: "Новый пользователь",
    description: "Player2 зарегистрировался на сервере",
    time: "45 минут назад"
  },
  {
    id: 3,
    type: "star",
    title: "Рейтинг уровня изменен",
    description: "Admin оценил Level Y в 8 звезд",
    time: "2 часа назад"
  },
  {
    id: 4,
    type: "report",
    title: "Отчет об ошибке",
    description: "Player3 сообщил о проблеме с уровнем Z",
    time: "3 часа назад"
  },
  {
    id: 5,
    type: "level",
    title: "Уровень удален",
    description: "Admin удалил уровень Level W",
    time: "5 часов назад"
  }
];

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "user":
      return <User className="h-4 w-4 text-blue-400" />;
    case "level":
      return <FileText className="h-4 w-4 text-green-400" />;
    case "star":
      return <Star className="h-4 w-4 text-yellow-400" />;
    case "report":
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    default:
      return <Clock className="h-4 w-4 text-zinc-400" />;
  }
};

const RecentActivity = () => {
  return (
    <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Недавняя активность</CardTitle>
        <CardDescription>Последние действия на сервере</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
              <div className="mt-0.5 bg-zinc-800/80 p-2 rounded-md">
                <ActivityIcon type={item.type} />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-200 truncate">{item.title}</p>
                  <Badge variant="outline" className="h-5 px-1.5 text-xs bg-zinc-800/50 text-zinc-400 border-zinc-700">
                    {item.time}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MusicIcon, Upload, LayoutGrid, UserPlus, ListTodo } from "lucide-react";

const QuickActions = () => {
  return (
    <Card className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link href="/panel/music/upload" passHref>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-300"
          >
            <MusicIcon className="h-4 w-4 mr-2" />
            Загрузить музыку
          </Button>
        </Link>
        
        <Link href="/panel/levels/rate" passHref>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-300"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Оценить уровни
          </Button>
        </Link>
        
        <Link href="/panel/packs/create" passHref>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-300"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Создать мап-пак
          </Button>
        </Link>
        
        <Link href="/panel/accounts/create" passHref>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Создать аккаунт
          </Button>
        </Link>
        
        <Button 
          variant="default" 
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Открыть консоль
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
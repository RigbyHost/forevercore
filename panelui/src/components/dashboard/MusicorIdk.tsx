import React, { useState } from 'react';
import { Music, Play, Pause, ExternalLink, Download, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Song {
  ID: number;
  name: string;
  authorName: string;
  size: string;
  download: string;
  originalLink?: string;
}

interface SongListProps {
  songs: Song[];
  currentPage: number;
  totalPages: number;
}

export default function SongList({ songs, currentPage, totalPages }: SongListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: number]: HTMLAudioElement }>({});
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Фильтрация песен по поисковому запросу
  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Функция для воспроизведения/паузы аудио
  const togglePlay = (songId: number, url: string) => {
    // Если уже есть аудиоэлемент для этой песни
    if (audioElements[songId]) {
      if (currentlyPlaying === songId) {
        // Если эта песня сейчас играет, поставить на паузу
        audioElements[songId].pause();
        setCurrentlyPlaying(null);
      } else {
        // Если играет другая песня, остановить её и начать эту
        if (currentlyPlaying !== null && audioElements[currentlyPlaying]) {
          audioElements[currentlyPlaying].pause();
        }
        audioElements[songId].play().catch(error => {
          console.error("Ошибка воспроизведения:", error);
        });
        setCurrentlyPlaying(songId);
      }
    } else {
      // Создать новый аудиоэлемент
      const audio = new Audio(url);
      
      // Настройка обработчиков событий
      audio.onended = () => setCurrentlyPlaying(null);
      audio.onpause = () => setCurrentlyPlaying(null);
      audio.onerror = () => {
        console.error("Ошибка загрузки аудио:", url);
        setCurrentlyPlaying(null);
      };
      
      // Сохранить аудиоэлемент и начать воспроизведение
      setAudioElements(prev => ({ ...prev, [songId]: audio }));
      
      audio.play().catch(error => {
        console.error("Ошибка воспроизведения:", error);
      });
      
      setCurrentlyPlaying(songId);
    }
  };

  // Очистка аудиоэлементов при размонтировании компонента
  React.useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);

  // Функция для открытия подробной информации
  const showSongDetails = (song: Song) => {
    setSelectedSong(song);
  };

  // Генерация страниц для пагинации
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink href={`/panel/music/list/offset.${i-1}`} isActive={i === currentPage + 1}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="relative">
      {/* Эффект свечения на фоне */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
      </div>

      <Card className="w-full bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl text-white">Список музыки</CardTitle>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700">Всего: {songs.length}</Badge>
          </div>
          <CardDescription>
            Библиотека музыки, доступная в вашем GDPS
          </CardDescription>
          
          <div className="mt-4">
            <Input
              className="bg-zinc-800/50 border-zinc-700"
              placeholder="Поиск по названию или автору..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border border-zinc-800">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 w-12 text-center">#</th>
                  <th scope="col" className="px-4 py-3">Название</th>
                  <th scope="col" className="px-4 py-3">Автор</th>
                  <th scope="col" className="px-4 py-3">Размер</th>
                  <th scope="col" className="px-4 py-3 w-32 text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <tr key={song.ID} className="bg-zinc-900/30 border-b border-zinc-800 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 text-center">{song.ID}</td>
                      <td className="px-4 py-3 font-medium text-white">{song.name}</td>
                      <td className="px-4 py-3 text-zinc-300">{song.authorName}</td>
                      <td className="px-4 py-3">{parseFloat(song.size).toFixed(2)} MB</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                  onClick={() => togglePlay(song.ID, song.download)}
                                >
                                  {currentlyPlaying === song.ID ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {currentlyPlaying === song.ID ? "Пауза" : "Воспроизвести"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                  onClick={() => showSongDetails(song)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Подробная информация
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                  onClick={() => window.open(song.download, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Скачать
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-zinc-900/30 border-b border-zinc-800">
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      {searchTerm ? "Песни не найдены" : "Список пуст"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 0 && (
                <PaginationItem>
                  <PaginationPrevious href={`/panel/music/list/offset.${currentPage - 1}`} />
                </PaginationItem>
              )}
              
              {generatePaginationItems()}
              
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationNext href={`/panel/music/list/offset.${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
      
      {/* Диалог подробной информации о песне */}
      <Dialog open={!!selectedSong} onOpenChange={(open) => !open && setSelectedSong(null)}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Информация о песне</DialogTitle>
            <DialogDescription>
              Подробные данные о выбранной песне
            </DialogDescription>
          </DialogHeader>
          
          {selectedSong && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">ID песни</div>
                <div className="text-white font-medium">{selectedSong.ID}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">Название</div>
                <div className="text-white font-medium">{selectedSong.name}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">Автор</div>
                <div className="text-white font-medium">{selectedSong.authorName}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">Размер</div>
                <div className="text-white font-medium">{parseFloat(selectedSong.size).toFixed(2)} MB</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">URL</div>
                <div className="text-white text-xs break-all font-medium">
                  {selectedSong.download}
                </div>
              </div>
              
              {selectedSong.originalLink && (
                <div className="space-y-2">
                  <div className="text-sm text-zinc-400">Оригинальная ссылка</div>
                  <div className="text-white text-xs break-all font-medium">
                    {selectedSong.originalLink}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-300"
                  onClick={() => setSelectedSong(null)}
                >
                  Закрыть
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-blue-400 hover:text-blue-300 hover:border-blue-700"
                    onClick={() => window.open(selectedSong.download, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </Button>
                  
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => togglePlay(selectedSong.ID, selectedSong.download)}
                  >
                    {currentlyPlaying === selectedSong.ID ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Пауза
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Воспроизвести
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Youtube, Music, CheckCircle2, AlertTriangle, Copy, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Схема валидации формы
const formSchema = z.object({
  songurl: z.string()
    .min(1, { message: "URL видео обязателен" })
    .url({ message: "Введите корректный URL" })
    .refine(
      (url) => url.includes('youtube.com/') || url.includes('youtu.be/'),
      { message: "Введите корректную ссылку на YouTube" }
    ),
  songname: z.string()
    .min(3, { message: "Название песни должно содержать минимум 3 символа" })
    .max(40, { message: "Название песни не должно превышать 40 символов" })
});

type FormValues = z.infer<typeof formSchema>;

interface YoutubeUploadProps {
  captchaKey: string;
}

export default function YoutubeUploadForm({ captchaKey }: YoutubeUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'captcha-error' | 'duplicate'>('idle');
  const [songId, setSongId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songurl: "",
      songname: ""
    }
  });

  // Инициализация и обработка капчи
  const initCaptcha = () => {
    if (window.hcaptcha) {
      const container = document.getElementById('h-captcha');
      if (container) {
        container.innerHTML = '';
        
        window.hcaptcha.render('h-captcha', {
          sitekey: captchaKey,
          callback: (token: string) => {
            setCaptchaToken(token);
          },
          'expired-callback': () => {
            setCaptchaToken(null);
          },
          'error-callback': () => {
            setCaptchaToken(null);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!window.hcaptcha) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = initCaptcha;
      
      document.head.appendChild(script);
    } else {
      initCaptcha();
    }
    
    return () => {
      if (window.hcaptcha) {
        try {
          window.hcaptcha.reset();
        } catch (error) {
          console.error("Ошибка при сбросе captcha:", error);
        }
      }
    };
  }, [captchaKey]);

  // Получение информации о видео для автозаполнения
  const getVideoInfo = async (url: string) => {
    if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
      setVideoTitle(null);
      setVideoThumbnail(null);
      setIsValidUrl(false);
      return;
    }
    
    setIsValidUrl(true);
    setIsValidating(true);
    
    try {
      // Извлечение ID видео из URL
      let videoId = '';
      
      if (url.includes('youtube.com/watch?v=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (!videoId) {
        setIsValidating(false);
        return;
      }
      
      // Загрузка данных из oEmbed API YouTube
      // Обратите внимание: в реальном проекте лучше делать запрос через серверный прокси
      // чтобы избежать проблем с CORS
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        setVideoTitle(data.title);
        form.setValue('songname', data.title.substring(0, 40)); // Ограничение длины названия
        setVideoThumbnail(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
      } else {
        throw new Error('Не удалось получить информацию о видео');
      }
    } catch (error) {
      console.error('Ошибка при получении информации о видео:', error);
      // Не устанавливаем видимую ошибку, просто не показываем предпросмотр
    } finally {
      setIsValidating(false);
    }
  };

  // Обработка изменения URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('songurl', url);
    
    // Получение информации о видео при вводе корректного URL
    if (url && (url.includes('youtube.com/') || url.includes('youtu.be/'))) {
      getVideoInfo(url);
    } else {
      setVideoTitle(null);
      setVideoThumbnail(null);
      setIsValidUrl(false);
    }
  };

  // Обработка отправки формы
  const onSubmit = async (data: FormValues) => {
    if (!captchaToken) {
      setStatus('captcha-error');
      toast.error('Пожалуйста, подтвердите, что вы не робот');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const formData = new URLSearchParams();
      formData.append('songurl', data.songurl);
      formData.append('songname', data.songname);
      formData.append('captchaResponse', captchaToken);

      const response = await fetch('/panel/music/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.text();
      
      // Обработка различных ответов сервера
      if (result.includes("Success:")) {
        setStatus('success');
        setSongId(result.split(":")[1]);
        toast.success('Песня успешно загружена!');
        form.reset();
        setVideoTitle(null);
        setVideoThumbnail(null);
        setIsValidUrl(false);
        
        // Сбросить капчу
        if (window.hcaptcha) {
          window.hcaptcha.reset();
          setCaptchaToken(null);
        }
      } else if (result.includes("DublicateSongException:")) {
        setStatus('duplicate');
        setSongId(result.split(":")[1]);
        toast.error('Эта песня уже загружена');
      } else if (result.includes("CapchaIsNotCompleted:")) {
        setStatus('captcha-error');
        toast.error('Пожалуйста, подтвердите, что вы не робот');
        
        // Сбросить капчу
        if (window.hcaptcha) {
          window.hcaptcha.reset();
          setCaptchaToken(null);
        }
      } else {
        setStatus('error');
        toast.error('Ошибка при загрузке песни');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Произошла ошибка при загрузке песни');
      console.error('Ошибка при загрузке песни:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Эффект свечения на фоне */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
      </div>

      <Card className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl text-white">Загрузка музыки с YouTube</CardTitle>
          </div>
          <CardDescription>
            Загрузите музыку из видео на YouTube для использования в GDPS
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="songurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL видео на YouTube</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          className="bg-zinc-800/50 border-zinc-700 pr-10"
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                          onChange={handleUrlChange}
                        />
                      </FormControl>
                      {isValidating ? (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </div>
                      ) : isValidUrl ? (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : null}
                    </div>
                    <FormDescription className="text-xs text-zinc-500">
                      Поддерживаются ссылки формата youtube.com/watch?v= и youtu.be/
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {videoThumbnail && (
                <div className="rounded-md overflow-hidden border border-zinc-800 bg-zinc-800/50">
                  <div className="relative pb-9/16">
                    <img 
                      src={videoThumbnail} 
                      alt="Предпросмотр видео" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-xs text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap">
                    {videoTitle}
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="songname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название песни</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-800/50 border-zinc-700"
                        placeholder="Введите название песни"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">
                      Это название будет отображаться в игре (макс. 40 символов)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* hCaptcha контейнер */}
              <div className="flex justify-center my-4">
                <div id="h-captcha"></div>
              </div>

              {status === 'success' && (
                <Alert variant="default" className="bg-green-900/20 text-green-400 border-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Загрузка успешна!</AlertTitle>
                  <AlertDescription>
                    Песня успешно загружена и доступна под ID: {songId}
                  </AlertDescription>
                </Alert>
              )}

              {status === 'duplicate' && (
                <Alert variant="default" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Песня уже существует</AlertTitle>
                  <AlertDescription>
                    Эта песня уже загружена в систему с ID: {songId}
                  </AlertDescription>
                </Alert>
              )}

              {status === 'captcha-error' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ошибка проверки captcha</AlertTitle>
                  <AlertDescription>
                    Пожалуйста, пройдите проверку captcha перед загрузкой.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ошибка загрузки</AlertTitle>
                  <AlertDescription>
                    Произошла ошибка при загрузке песни. Проверьте URL и попробуйте снова.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || !captchaToken}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Загрузка...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Music className="h-4 w-4 mr-2" />
                    Загрузить музыку
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
          <p className="text-xs">
            <span className="text-yellow-400">⚠️</span> Загружайте только ту музыку, на которую имеете права или которая разрешена для некоммерческого использования
          </p>
        </CardFooter>
      </Card>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(23, 23, 23, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            border: '1px solid rgba(63, 63, 70, 0.4)'
          }
        }}
      />
    </div>
  );
}

// Объявление типа для hcaptcha в глобальном пространстве
declare global {
  interface Window {
    hcaptcha: {
      render: (containerId: string, options: any) => void;
      reset: () => void;
    };
  }
}
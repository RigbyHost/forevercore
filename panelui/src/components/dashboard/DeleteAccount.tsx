import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster, toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteAccountProps {
  accountID: string;
  userName: string;
  captchaKey: string;
}

export default function DeleteAccount({ accountID, userName, captchaKey }: DeleteAccountProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'captcha-error'>('idle');
  const [showLogoutCountdown, setShowLogoutCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Функция для взаимодействия с captcha, запускается после монтирования компонента
  const initCaptcha = () => {
    // Убедимся, что hcaptcha загружен на странице
    if (window.hcaptcha) {
      // Очистим контейнер, если он уже был инициализирован
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

  React.useEffect(() => {
    // Загрузка скрипта hcaptcha, если он еще не загружен
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
      // Очистка при размонтировании компонента
      if (window.hcaptcha) {
        try {
          window.hcaptcha.reset();
        } catch (error) {
          console.error("Ошибка при сбросе captcha:", error);
        }
      }
    };
  }, [captchaKey]);

  // Эффект для обратного отсчёта перед перенаправлением
  React.useEffect(() => {
    if (showLogoutCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showLogoutCountdown && countdown === 0) {
      // Выход и перенаправление на страницу входа
      window.location.href = '/panel/accounts/login';
    }
  }, [showLogoutCountdown, countdown]);

  const handleDeleteAccount = async () => {
    if (!captchaToken) {
      setStatus('captcha-error');
      toast.error('Пожалуйста, подтвердите, что вы не робот');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const formData = new URLSearchParams();
      formData.append('accountID', accountID);
      formData.append('captchaResponse', captchaToken);

      const response = await fetch('/panel/accounts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.text();

      if (result === "1") {
        setStatus('success');
        toast.success('Аккаунт успешно удален');
        
        // Начать обратный отсчет перед перенаправлением
        setShowLogoutCountdown(true);
        
        // Очистить куки и подготовиться к перенаправлению
        document.cookie = 'username=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } else if (result === "-2") {
        setStatus('captcha-error');
        toast.error('Ошибка проверки captcha');
        // Пересоздаем captcha
        if (window.hcaptcha) {
          window.hcaptcha.reset();
        }
      } else {
        setStatus('error');
        toast.error('Ошибка при удалении аккаунта');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Произошла ошибка при удалении аккаунта');
      console.error('Ошибка при удалении аккаунта:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Эффект свечения на фоне */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-red-500/10 blur-3xl rounded-full"></div>
      </div>

      <Card className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl text-white">Удаление аккаунта</CardTitle>
          </div>
          <CardDescription>
            Вы собираетесь удалить аккаунт: <span className="font-medium text-red-400">{userName}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Внимание! Это действие необратимо!</AlertTitle>
            <AlertDescription>
              Удаление аккаунта приведет к потере всех ваших данных, включая уровни, достижения и статистику. Это действие нельзя отменить.
            </AlertDescription>
          </Alert>

          {status === 'captcha-error' && (
            <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ошибка проверки captcha</AlertTitle>
              <AlertDescription>
                Пожалуйста, пройдите проверку captcha перед удалением аккаунта.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ошибка при удалении аккаунта</AlertTitle>
              <AlertDescription>
                Произошла техническая ошибка при удалении аккаунта. Пожалуйста, попробуйте позже или обратитесь к администратору.
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <Alert variant="default" className="bg-green-900/20 text-green-400 border-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Аккаунт успешно удален</AlertTitle>
              <AlertDescription>
                Ваш аккаунт был успешно удален. Вы будете перенаправлены на страницу входа через {countdown} секунд.
              </AlertDescription>
            </Alert>
          )}

          {/* hCaptcha контейнер */}
          {status !== 'success' && (
            <div className="flex justify-center my-4">
              <div id="h-captcha"></div>
            </div>
          )}

          {status !== 'success' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading || !captchaToken}
                >
                  {isLoading ? "Удаление аккаунта..." : "Удалить аккаунт"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Это действие нельзя отменить. Все данные аккаунта будут безвозвратно удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700" 
                    onClick={handleDeleteAccount}
                  >
                    Да, удалить аккаунт
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
          <p className="text-xs">
            <span className="text-red-400">⚠️</span> После удаления вы не сможете восстановить доступ к аккаунту или создать новый с тем же именем пользователя
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
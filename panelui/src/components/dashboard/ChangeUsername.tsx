import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCog, CheckCircle, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from 'react-hot-toast';

// Схема валидации формы
const formSchema = z.object({
  newUsername: z.string()
    .min(3, { message: "Имя пользователя должно содержать минимум 3 символа" })
    .max(20, { message: "Имя пользователя не должно превышать 20 символов" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Имя пользователя может содержать только буквы, цифры и подчеркивания" })
});

type FormValues = z.infer<typeof formSchema>;

export default function ChangeUsernameForm({ currentUsername }: { currentUsername: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'error-too-long' | 'error-too-short'>('idle');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newUsername: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setStatus('idle');
    
    try {
      const formData = new URLSearchParams();
      formData.append('newusr', data.newUsername);
      
      const response = await fetch('/panel/accounts/changeUsername', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.text();

      if (result === "1") {
        setStatus('success');
        toast.success("Имя пользователя успешно изменено!");
        form.reset();
        
        // Обновляем куки после короткой задержки
        setTimeout(() => {
          document.cookie = `username=${data.newUsername}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 дней
          window.location.reload(); // Перезагружаем страницу для обновления UI
        }, 1500);
      } else if (result === "-2") {
        setStatus('error-too-long');
        toast.error("Имя пользователя слишком длинное");
      } else if (result === "-3") {
        setStatus('error-too-short');
        toast.error("Имя пользователя слишком короткое");
      } else {
        setStatus('error');
        toast.error("Произошла ошибка при изменении имени пользователя");
      }
    } catch (error) {
      setStatus('error');
      toast.error("Произошла ошибка при изменении имени пользователя");
      console.error("Ошибка при смене имени пользователя:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Эффект свечения на фоне */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
      </div>

      <Card className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl text-white">Изменение имени пользователя</CardTitle>
          </div>
          <CardDescription>
            Ваше текущее имя пользователя: <span className="font-medium text-blue-400">{currentUsername}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Новое имя пользователя</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-800/50 border-zinc-700"
                        placeholder="Введите новое имя пользователя"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">
                      От 3 до 20 символов, только буквы, цифры и подчеркивания
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {status === 'success' && (
                <Alert variant="default" className="bg-green-900/20 text-green-400 border-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Успех!</AlertTitle>
                  <AlertDescription>
                    Имя пользователя успешно изменено на <span className="font-medium">{form.getValues().newUsername}</span>. Страница будет перезагружена.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error-too-long' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Слишком длинное имя!</AlertTitle>
                  <AlertDescription>
                    Имя пользователя не должно превышать 20 символов.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error-too-short' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Слишком короткое имя!</AlertTitle>
                  <AlertDescription>
                    Имя пользователя должно содержать минимум 3 символа.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ошибка!</AlertTitle>
                  <AlertDescription>
                    Не удалось изменить имя пользователя. Возможно, это имя уже занято.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Изменение имени..." : "Изменить имя пользователя"}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
          <p className="text-xs">
            <span className="text-yellow-400">⚠️</span> Изменение имени пользователя повлияет на ваш вход и отображение в игре
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
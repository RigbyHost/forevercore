import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from 'react-hot-toast';

// Схема валидации формы
const formSchema = z.object({
  username: z.string().min(1, { message: "Имя пользователя обязательно" }),
  password: z.string().min(1, { message: "Пароль обязателен" })
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage({ gdpsName = 'GDPS Server' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(false);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);

      const response = await fetch('/panel/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.text();

      if (result === "1") {
        toast.success("Вход выполнен успешно!");
        
        // Перенаправить на панель управления
        setTimeout(() => {
          window.location.href = '/panel';
        }, 500);
      } else {
        setError(true);
        toast.error("Неверное имя пользователя или пароль");
      }
    } catch (error) {
      setError(true);
      toast.error("Ошибка подключения к серверу");
      console.error("Ошибка входа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Фоновое свечение */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-indigo-600/10 blur-3xl rounded-full"></div>
      </div>
      
      <Card className="w-full max-w-md bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-600 rounded-xl w-12 h-12 flex items-center justify-center">
              <span className="text-white font-bold text-xl">GD</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Вход в {gdpsName}</CardTitle>
          <CardDescription className="text-center">
            Введите свои учетные данные для входа
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-800/50 border-zinc-700"
                        placeholder="Введите имя пользователя"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="bg-zinc-800/50 border-zinc-700"
                          placeholder="Введите пароль"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-zinc-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ошибка входа</AlertTitle>
                  <AlertDescription>
                    Неверное имя пользователя или пароль. Пожалуйста, попробуйте снова.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white btn-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Вход в систему...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col items-center space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
          <p className="text-xs text-center">
            Вход выполняется с использованием вашего аккаунта Geometry Dash на этом сервере.
          </p>
          <p className="text-xs text-center">
            Если у вас нет аккаунта, создайте его прямо в игре через настройки.
          </p>
          <div className="mt-3 text-center">
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} {gdpsName} • ForeverCore GDPS
            </p>
          </div>
        </CardFooter>
      </Card>
      <Toaster 
        position="top-center"
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
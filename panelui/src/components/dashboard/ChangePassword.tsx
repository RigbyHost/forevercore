import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from 'react-hot-toast';

// Схема валидации формы
const formSchema = z.object({
  currentPassword: z.string().min(4, { message: "Текущий пароль обязателен" }),
  newPassword: z.string()
    .min(8, { message: "Пароль должен содержать минимум 8 символов" })
    .regex(/[A-Z]/, { message: "Пароль должен содержать хотя бы одну заглавную букву" })
    .regex(/[0-9]/, { message: "Пароль должен содержать хотя бы одну цифру" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ChangePasswordForm({ accountID, userName }: { accountID: string; userName: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setStatus('idle');
    
    try {
      const formData = new URLSearchParams();
      formData.append('userName', userName);
      formData.append('oldpassword', data.currentPassword);
      formData.append('newpassword', data.newPassword);
      formData.append('accid', accountID);

      const response = await fetch('/panel/accounts/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.text();

      if (result === "1") {
        setStatus('success');
        toast.success("Пароль успешно изменен!");
        form.reset();
      } else {
        setStatus('error');
        toast.error("Неверный текущий пароль или ошибка сервера");
      }
    } catch (error) {
      setStatus('error');
      toast.error("Произошла ошибка при изменении пароля");
      console.error("Ошибка при смене пароля:", error);
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
            <Key className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl text-white">Изменение пароля</CardTitle>
          </div>
          <CardDescription>
            Введите текущий пароль и новый пароль для аккаунта
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текущий пароль</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          className="bg-zinc-800/50 border-zinc-700"
                          placeholder="Введите текущий пароль"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-zinc-400"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Новый пароль</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          className="bg-zinc-800/50 border-zinc-700"
                          placeholder="Введите новый пароль"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-zinc-400"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormDescription className="text-xs text-zinc-500">
                      Минимум 8 символов, с заглавной буквой и цифрой
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подтверждение пароля</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="bg-zinc-800/50 border-zinc-700"
                          placeholder="Подтвердите новый пароль"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-zinc-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {status === 'success' && (
                <Alert variant="default" className="bg-green-900/20 text-green-400 border-green-800">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Успех!</AlertTitle>
                  <AlertDescription>
                    Пароль успешно изменен. При следующем входе используйте новый пароль.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-800">
                  <AlertTitle>Ошибка!</AlertTitle>
                  <AlertDescription>
                    Не удалось изменить пароль. Пожалуйста, проверьте текущий пароль и попробуйте снова.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Изменение пароля..." : "Изменить пароль"}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
          <p className="text-xs">
            <span className="text-yellow-400">⚠️</span> После смены пароля убедитесь, что вы запомнили новый пароль и обновили его в Game Manager
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
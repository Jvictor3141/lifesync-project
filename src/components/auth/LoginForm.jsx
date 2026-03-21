import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import BackgroundDecor from '@/shared/components/BackgroundDecor';
import PasswordChecklist from '@/shared/components/PasswordChecklist';
import { isStrongPassword } from '@/shared/lib/password';
import logo from '@/assets/logo-lifesync.png';

const getAuthErrorMessage = (error, isLogin) => {
  const code = error?.code;

  if (isLogin) {
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      return 'E-mail ou senha inválidos.';
    }

    return 'Não foi possível entrar. Tente novamente.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Este e-mail já está em uso.';
  }

  if (code === 'auth/invalid-email') {
    return 'E-mail inválido.';
  }

  return 'Não foi possível criar a conta.';
};

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!isStrongPassword(password)) {
          setError('A senha não atende aos requisitos mínimos.');
          return;
        }

        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
        }

        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError, isLogin));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setResetError('');
    setResetLoading(true);

    try {
      const nextEmail = (resetEmail || email).trim().toLowerCase();

      if (!nextEmail) {
        setResetError('Informe o e-mail da conta.');
        return;
      }

      await sendPasswordResetEmail(auth, nextEmail);
      setResetOpen(false);
      setResetEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsLogin(true);
      toast.success('Enviamos um link de recuperação para seu e-mail.');
    } catch (authError) {
      if (authError?.code === 'auth/user-not-found') {
        setResetError('Este e-mail não está cadastrado.');
      } else if (authError?.code === 'auth/invalid-email') {
        setResetError('E-mail inválido.');
      } else {
        setResetError('Não foi possível enviar o e-mail de recuperação.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="background login-grid-bg relative flex min-h-screen items-center justify-center p-4">
      <BackgroundDecor />

      <Card className="card-fundo noise-overlay relative w-full max-w-5xl overflow-hidden border-0">
        <div className="grid lg:grid-cols-[0.96fr_1.04fr]">
          <div className="hidden border-r border-border/70 bg-[var(--planner-sage-soft)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="planner-kicker">Agenda com calma</p>
              <img
                src={logo}
                alt="LifeSync"
                className="mt-6 h-14 w-auto drop-shadow-sm"
              />
              <h1 className="mt-8 text-4xl font-semibold text-foreground">
                Planeje rotinas e acompanhe finanças sem ruído visual.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Uma interface com clima de planner físico: confortável para revisar o dia, registrar prioridades e manter contexto.
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="planner-chip w-fit">Blocos de rotina por período</div>
              <div className="planner-chip w-fit">Calendário com eventos e recorrências</div>
              <div className="planner-chip w-fit">Leitura financeira mensal</div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <CardHeader className="px-0 pt-0 text-left">
              <p className="planner-kicker">{isLogin ? 'Acesso seguro' : 'Nova conta'}</p>
              <CardTitle className="mt-6 text-3xl font-semibold text-foreground">
                {isLogin ? 'Entre para abrir sua agenda.' : 'Crie sua conta para começar.'}
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isLogin
                  ? 'Retome sua rotina, compromissos e visão financeira em poucos segundos.'
                  : 'Sua conta sincroniza tarefas, datas especiais e lançamentos em um único espaço.'}
              </p>
            </CardHeader>

            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">E-mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Senha</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="pr-11"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isLogin && (
                    <PasswordChecklist password={password} className="mt-2 text-muted-foreground" />
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Confirmar senha</label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        className="pr-11"
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => setShowConfirm((current) => !current)}
                      >
                        {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className={`mt-2 text-xs ${password === confirmPassword ? 'text-[var(--planner-sage-deep)]' : 'text-[var(--planner-terracotta)]'}`}>
                        {password === confirmPassword ? 'Senhas iguais' : 'As senhas devem ser iguais'}
                      </div>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end -mt-1">
                    <Dialog
                      open={resetOpen}
                      onOpenChange={(open) => {
                        setResetOpen(open);
                        if (open) {
                          setResetEmail(email);
                          setResetError('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-sm text-[var(--planner-terracotta)] hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          Esqueci minha senha
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Recuperar senha</DialogTitle>
                          <DialogDescription>
                            Informe o e-mail da sua conta. Enviaremos um link para redefinir sua senha.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium">E-mail</label>
                            <Input
                              type="email"
                              value={resetEmail}
                              onChange={(event) => setResetEmail(event.target.value)}
                              placeholder="seuemail@exemplo.com"
                              required
                            />
                          </div>
                          {resetError && (
                            <Alert variant="destructive">
                              <AlertDescription>{resetError}</AlertDescription>
                            </Alert>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={handlePasswordReset}
                              disabled={resetLoading}
                            >
                              {resetLoading ? 'Enviando...' : 'Enviar e-mail'}
                            </Button>
                          </DialogFooter>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  {isLogin ? 'Criar uma conta' : 'Voltar ao login'}
                </Button>
              </form>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (pwd) => {
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    
    return hasLength && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!validatePassword(password)) {
          setError('A senha deve ter no mínimo 8 caracteres e incluir: letra maiúscula, minúscula, número e símbolo');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(isLogin ? 'E-mail ou senha inválidos!' : 'Erro ao criar conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-diagonal flex items-center justify-center p-4 relative">
      <Card className="w-full max-w-md bg-white/15 backdrop-blur-xl border-white/40 shadow-xl ring-1 ring-white/20 rounded-2xl noise-overlay relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white drop-shadow-sm">
            {isLogin ? 'Entrar na Agenda' : 'Bem Vindo ao LifeSync'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">E-mail:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/50 bg-white/20 text-white placeholder:text-white/80 focus:bg-white/25"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Senha:</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-white/50 bg-white/20 text-white placeholder:text-white/80 focus:bg-white/25 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <div className="text-xs text-white/80 mt-1">
                  A senha deve ter no mínimo 8 caracteres e incluir:
                  <ul className="list-disc ml-4 mt-1">
                    <li className={password.length >= 8 ? 'text-green-500' : 'text-red-500'}>8 caracteres</li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}>Letra maiúscula</li>
                    <li className={/[a-z]/.test(password) ? 'text-green-500' : 'text-red-500'}>Letra minúscula</li>
                    <li className={/[0-9]/.test(password) ? 'text-green-500' : 'text-red-500'}>Número</li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-red-500'}>Símbolo</li>
                  </ul>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Confirmar Senha:</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-white/50 bg-white/20 text-white placeholder:text-white/80 focus:bg-white/25 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black cursor-pointer"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-400' : 'text-red-300'}`}>
                    {password === confirmPassword ? 'Senhas iguais ✓' : 'As senhas devem ser iguais'}
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>

            <Button
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {isLogin ? 'Criar uma conta' : 'Voltar ao login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;


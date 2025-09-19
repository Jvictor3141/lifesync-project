import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-pink-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            {isLogin ? 'Entrar na Agenda' : 'Bem Vindo ao LifeSync'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-mail:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-purple-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Senha:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-purple-200"
              />
              {!isLogin && (
                <div className="text-xs text-gray-500 mt-1">
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
                <label className="block text-sm font-medium mb-1">Confirmar Senha:</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-purple-200"
                />
                {confirmPassword && (
                  <div className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                    {password === confirmPassword ? 'Senhas iguais ✓' : 'As senhas devem ser iguais'}
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
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


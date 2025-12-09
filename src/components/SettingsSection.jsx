import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { auth } from '@/lib/firebase';
import { updatePassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

const SettingsSection = ({ user }) => {
  // Futuro: permitir editar displayName
  // const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(() => {
    const local = typeof window !== 'undefined' ? localStorage.getItem('profilePhotoURL') : null;
    return local || user?.photoURL || '';
  });
  const [username, setUsername] = useState(user?.displayName || '');
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalConfirm, setModalConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    return hasLength && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword(modalPassword)) {
      toast.error('A senha deve ter no mínimo 8 caracteres e incluir: letra maiúscula, minúscula, número e símbolo');
      return;
    }
    if (modalPassword !== modalConfirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    try {
      setLoading(true);
      await updatePassword(auth.currentUser, modalPassword);
      setModalPassword('');
      setModalConfirm('');
      setPasswordOpen(false);
      toast.success('Senha atualizada com sucesso.');
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      toast.error('Erro ao atualizar senha. Faça login novamente se necessário.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Email de redefinição de senha enviado.');
    } catch (err) {
      console.error('Erro ao enviar email de redefinição:', err);
      toast.error('Erro ao enviar email de redefinição.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Atualiza apenas displayName no Auth
      await updateProfile(auth.currentUser, {
        displayName: username || auth.currentUser?.displayName || 'Usuário',
      });
      // Salva foto localmente para não encher o banco
      if (typeof window !== 'undefined') {
        if (photoURL) {
          localStorage.setItem('profilePhotoURL', photoURL);
        } else {
          localStorage.removeItem('profilePhotoURL');
        }
      }
      toast.success('Perfil atualizado (nome) e foto salva localmente.');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      toast.error('Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Apenas exibição dos dados básicos; atualização de perfil (displayName/photoURL)
  // pode envolver updateProfile. Mantemos simples por enquanto, com campos editáveis futuros.

  const initial = (user?.displayName || username || user?.email || '?')[0]?.toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-pink-600">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-18">
              {photoURL ? (
                <AvatarImage src={photoURL} alt="Foto de perfil" className="object-cover w-full h-full" />
              ) : (
                <AvatarFallback>{initial}</AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-gray-800 dark:text-gray-200 font-medium">
                  {user?.displayName || username || 'Usuário'}
                </div>
                <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 cursor-pointer" aria-label="Editar perfil">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                      <DialogDescription>Atualize seu nome de usuário e foto de perfil.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      {/* Preview da foto atual */}
                      <div className="flex items-center gap-3">
                        <Avatar className="size-20">
                          {photoURL ? (
                            <AvatarImage src={photoURL} alt="Prévia da foto" className="object-cover w-full h-full" />
                          ) : (
                            <AvatarFallback>{initial}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Prévia da foto atual. Selecione um arquivo ou informe uma URL abaixo.
                        </div>
                      </div>
                      <Input
                        type="text"
                        placeholder="Nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result;
                            if (typeof dataUrl === 'string') {
                              setPhotoURL(dataUrl);
                              try {
                                localStorage.setItem('profilePhotoURL', dataUrl);
                                toast.success('Foto carregada localmente.');
                              } catch (err) {
                                console.error('Erro ao salvar foto local:', err);
                                toast.error('Não foi possível salvar a foto localmente.');
                              }
                            }
                          };
                          reader.onerror = () => {
                            toast.error('Falha ao ler a imagem.');
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <Input
                        type="url"
                        placeholder="URL da foto de perfil"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setProfileOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            setLoading(true);
                            // Limpa estado local
                            setUsername('');
                            setPhotoURL('');
                            // Remove foto do localStorage
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('profilePhotoURL');
                            }
                            // Atualiza Auth para valor padrão
                            await updateProfile(auth.currentUser, {
                              displayName: 'Usuário',
                            });
                            toast.success('Perfil redefinido para o padrão.');
                          } catch (err) {
                            console.error('Erro ao redefinir perfil:', err);
                            toast.error('Não foi possível redefinir o perfil.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Resetar Perfil
                      </Button>
                      <Button onClick={async () => { await handleSaveProfile(); setProfileOpen(false); }} className="bg-pink-500 hover:bg-pink-600">Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button disabled={loading} className="bg-pink-500 hover:bg-pink-600">
                  Trocar Senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Definir nova senha</DialogTitle>
                  <DialogDescription>
                    Use uma senha forte. Siga os requisitos abaixo para evitar erros.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nova senha</label>
                    <Input
                      type="password"
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      A senha deve ter no mínimo 8 caracteres e incluir:
                      <ul className="list-disc ml-4 mt-1">
                        <li className={modalPassword.length >= 8 ? 'text-green-500' : 'text-red-500'}>8 caracteres</li>
                        <li className={/[A-Z]/.test(modalPassword) ? 'text-green-500' : 'text-red-500'}>Letra maiúscula</li>
                        <li className={/[a-z]/.test(modalPassword) ? 'text-green-500' : 'text-red-500'}>Letra minúscula</li>
                        <li className={/[0-9]/.test(modalPassword) ? 'text-green-500' : 'text-red-500'}>Número</li>
                        <li className={/[^A-Za-z0-9]/.test(modalPassword) ? 'text-green-500' : 'text-red-500'}>Símbolo</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmar senha</label>
                    <Input
                      type="password"
                      value={modalConfirm}
                      onChange={(e) => setModalConfirm(e.target.value)}
                    />
                    {modalConfirm && (
                      <div className={`text-xs mt-1 ${modalPassword === modalConfirm ? 'text-green-500' : 'text-red-500'}`}>
                        {modalPassword === modalConfirm ? 'Senhas iguais ✓' : 'As senhas devem ser iguais'}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdatePassword} disabled={loading} className="bg-pink-500 hover:bg-pink-600">Salvar nova senha</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSendResetEmail} disabled={loading}>
              Enviar Email de Redefinição
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;

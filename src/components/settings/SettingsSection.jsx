import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { sendPasswordResetEmail, updatePassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import PasswordChecklist from '@/shared/components/PasswordChecklist';
import {
  STORAGE_KEYS,
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/shared/lib/local-storage';
import { isStrongPassword } from '@/shared/lib/password';

const SettingsSection = ({ user }) => {
  const [photoURL, setPhotoURL] = useState('');
  const [username, setUsername] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalConfirm, setModalConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhotoURL(readLocalStorage(STORAGE_KEYS.profilePhoto, user?.photoURL || ''));
    setUsername(user?.displayName || '');
  }, [user]);

  const initial = (user?.displayName || username || user?.email || '?')[0]?.toUpperCase();

  const handleUpdatePassword = async () => {
    if (!isStrongPassword(modalPassword)) {
      toast.error('A senha não atende aos requisitos mínimos.');
      return;
    }

    if (modalPassword !== modalConfirm) {
      toast.error('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(auth.currentUser, modalPassword);
      setModalPassword('');
      setModalConfirm('');
      setPasswordOpen(false);
      toast.success('Senha atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha. Faça login novamente se necessário.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, user.email);
      toast.success('E-mail de redefinição de senha enviado.');
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      toast.error('Erro ao enviar e-mail de redefinição.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      await updateProfile(auth.currentUser, {
        displayName: username || auth.currentUser?.displayName || 'Usuário',
      });

      if (photoURL) {
        writeLocalStorage(STORAGE_KEYS.profilePhoto, photoURL);
      } else {
        removeLocalStorage(STORAGE_KEYS.profilePhoto);
      }

      toast.success('Perfil atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = async () => {
    try {
      setLoading(true);
      setUsername('');
      setPhotoURL('');
      removeLocalStorage(STORAGE_KEYS.profilePhoto);

      await updateProfile(auth.currentUser, {
        displayName: 'Usuário',
      });

      toast.success('Perfil redefinido para o padrão.');
    } catch (error) {
      console.error('Erro ao redefinir perfil:', error);
      toast.error('Não foi possível redefinir o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <p className="planner-kicker">Conta</p>
          <CardTitle className="mt-4 text-2xl font-semibold text-foreground">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-[4.5rem] border border-border/70 bg-secondary">
                {photoURL ? (
                  <AvatarImage src={photoURL} alt="Foto de perfil" className="object-cover w-full h-full" />
                ) : (
                  <AvatarFallback className="bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)] font-semibold">
                    {initial}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="space-y-1">
                <div className="text-lg font-medium text-foreground">
                  {user?.displayName || username || 'Usuário'}
                </div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-2xl">
                  <Pencil className="w-4 h-4" />
                  Editar perfil
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar perfil</DialogTitle>
                  <DialogDescription>
                    Atualize seu nome de usuário e a foto de perfil.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-background/45 p-4">
                    <Avatar className="size-20 border border-border/70 bg-secondary">
                      {photoURL ? (
                        <AvatarImage src={photoURL} alt="Prévia da foto" className="object-cover w-full h-full" />
                      ) : (
                        <AvatarFallback className="bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)] font-semibold">
                          {initial}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-sm text-muted-foreground leading-6">
                      Prévia da foto atual. Você pode enviar um arquivo ou informar uma URL.
                    </div>
                  </div>

                  <Input
                    type="text"
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setPhotoURL(reader.result);
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
                    onChange={(event) => setPhotoURL(event.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setProfileOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    className="text-[var(--planner-terracotta)] border-[rgba(120,201,197,0.28)] hover:bg-[var(--planner-terracotta-soft)]"
                    onClick={handleResetProfile}
                  >
                    Resetar perfil
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleSaveProfile();
                      setProfileOpen(false);
                    }}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <p className="planner-kicker">Segurança</p>
          <CardTitle className="mt-4 text-2xl font-semibold text-foreground">Acesso e senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          <div className="flex gap-2 flex-wrap">
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button disabled={loading}>
                  Trocar senha
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Definir nova senha</DialogTitle>
                  <DialogDescription>
                    Use uma senha forte para manter sua conta protegida.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nova senha</label>
                    <Input
                      type="password"
                      value={modalPassword}
                      onChange={(event) => setModalPassword(event.target.value)}
                    />
                    <PasswordChecklist password={modalPassword} className="mt-2 text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Confirmar senha</label>
                    <Input
                      type="password"
                      value={modalConfirm}
                      onChange={(event) => setModalConfirm(event.target.value)}
                    />
                    {modalConfirm && (
                      <div className={`mt-2 text-xs ${modalPassword === modalConfirm ? 'text-[var(--planner-sage-deep)]' : 'text-[var(--planner-terracotta)]'}`}>
                        {modalPassword === modalConfirm ? 'Senhas iguais' : 'As senhas devem ser iguais'}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                  >
                    Salvar nova senha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleSendResetEmail} disabled={loading}>
              Enviar e-mail de redefinição
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;

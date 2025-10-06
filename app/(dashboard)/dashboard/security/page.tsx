'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransition } from 'react';
import { useState } from 'react';
import { AlertTriangle, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import { updatePasswordAction, deleteAccountAction } from './actions';

type ActionState = {
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordPending, startPasswordTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [passwordState, setPasswordState] = useState<ActionState>({});
  const [deleteState, setDeleteState] = useState<ActionState>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = (formData: FormData) => {
    startPasswordTransition(async () => {
      const result = await updatePasswordAction({}, formData);
      setPasswordState(result);
    });
  };

  const handleDeleteSubmit = (formData: FormData) => {
    startDeleteTransition(async () => {
      const result = await deleteAccountAction({}, formData);
      setDeleteState(result);
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Paramètres de Sécurité</h1>
      
      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Changer le Mot de Passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="mb-2">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    disabled={passwordPending}
                    placeholder="Entrez votre mot de passe actuel"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showCurrent ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="mb-2">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={passwordPending}
                    placeholder="Entrez un nouveau mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={passwordPending}
                    placeholder="Confirmez le nouveau mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {passwordState.error && (
                <div className="text-red-500 text-sm">{passwordState.error}</div>
              )}

              {passwordState.success && (
                <div className="text-green-500 text-sm">{passwordState.success}</div>
              )}

              <Button
                type="submit"
                disabled={passwordPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {passwordPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Zone Dangereuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">
                  Supprimer votre compte
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                ) : (
                  <form action={handleDeleteSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="confirmationPhrase" className="text-red-700 mb-2">
                        Tapez "supprimer mon compte" pour confirmer
                      </Label>
                      <Input
                        id="confirmationPhrase"
                        name="confirmationPhrase"
                        type="text"
                        required
                        disabled={deletePending}
                        placeholder="supprimer mon compte"
                        className="border-red-300 focus:border-red-500"
                        value={confirmationPhrase}
                        onChange={(e) => setConfirmationPhrase(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-red-700 mb-2">
                        Confirmez avec votre mot de passe
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={deletePending}
                        placeholder="Entrez votre mot de passe pour confirmer"
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>

                    {deleteState.error && (
                      <div className="text-red-500 text-sm">{deleteState.error}</div>
                    )}

                    {deleteState.success && (
                      <div className="text-green-500 text-sm">{deleteState.success}</div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        disabled={deletePending || confirmationPhrase !== 'supprimer mon compte'}
                        variant="destructive"
                      >
                        {deletePending ? 'Suppression...' : 'Confirmer la suppression'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setConfirmationPhrase('');
                        }}
                        disabled={deletePending}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
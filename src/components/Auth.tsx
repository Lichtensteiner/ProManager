import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { HardHat, Mail, Lock, User, Briefcase, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'ENGINEER' // Default role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      } else {
        // Inscription
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (signUpError) throw signUpError;

        if (authData.user) {
          // Créer le profil
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              name: formData.name,
              email: formData.email,
              role: formData.role
            }
          ]);

          if (profileError) throw profileError;
          
          setSuccess("Compte créé avec succès ! Si vous n'êtes pas redirigé, veuillez vérifier votre boîte mail.");
          // Basculer sur la connexion si la confirmation par email est activée
          // setIsLogin(true); 
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === '42P01') {
        setError("La table 'profiles' n'existe pas. Veuillez exécuter le script SQL dans Supabase.");
      } else if (err.message === 'Invalid login credentials') {
        setError("Email ou mot de passe incorrect. Si vous venez de supprimer votre compte, veuillez vous réinscrire.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Panneau de gauche (Image/Branding) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
            alt="Construction Site" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-12 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-8">
              <HardHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Gérez vos chantiers avec <span className="text-blue-400">précision</span>.
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              L'outil d'aide à la décision conçu spécifiquement pour les PME du BTP au Gabon. Suivez vos projets, lots et tâches en temps réel.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-900"></div>
              </div>
              <p>Rejoignez plus de 50 entreprises partenaires</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Panneau de droite (Formulaire) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="absolute top-8 right-8 lg:hidden">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <HardHat className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Bon retour !' : 'Créer un compte'}
            </h2>
            <p className="text-slate-500 mb-8">
              {isLogin 
                ? 'Veuillez entrer vos identifiants pour accéder à votre espace.' 
                : 'Remplissez les informations ci-dessous pour rejoindre la plateforme.'}
            </p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium mb-6 border border-emerald-100"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom complet</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required={!isLogin}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Rôle</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="SECRETARY">Secrétaire</option>
                        <option value="ENGINEER">Ingénieur</option>
                        <option value="TECH_DIRECTOR">Directeur Technique</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="vous@entreprise.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Mot de passe</label>
                  {isLogin && (
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Mot de passe oublié ?</a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Se connecter' : 'Créer mon compte'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-slate-500">
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="ml-2 font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </p>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => window.location.href = '/ai-architect'} 
                  className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Essayer l'Architecte IA (Démo gratuite)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

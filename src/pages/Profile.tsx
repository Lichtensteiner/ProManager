import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Briefcase, Camera, Save, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    missions: '',
    roles_description: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        missions: user.missions || '',
        roles_description: user.roles_description || '',
      });
    }
  }, [user]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SECRETARY': return 'Secrétaire';
      case 'ENGINEER': return 'Ingénieur';
      case 'TECH_DIRECTOR': return 'Directeur Technique';
      case 'ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          missions: formData.missions,
          roles_description: formData.roles_description,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mon Profil</h1>
        <p className="text-slate-500 mt-1 text-lg">Gérez vos informations personnelles et préférences.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne de gauche : Avatar et Infos rapides */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 z-0"></div>
            
            <div className="relative z-10 mt-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-50">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mt-6">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-2 bg-blue-50 px-3 py-1 rounded-full">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">{getRoleLabel(user.role)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Colonne de droite : Formulaire */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Informations Personnelles</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>

            <div className="p-8">
              {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Adresse Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="email" 
                        disabled
                        value={user.email}
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" 
                        title="L'adresse email ne peut pas être modifiée ici."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de téléphone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="tel" 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
                        placeholder="+241 00 00 00 00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Rôle système</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        disabled
                        value={getRoleLabel(user.role)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description des rôles & responsabilités</label>
                    <textarea 
                      disabled={!isEditing}
                      value={formData.roles_description}
                      onChange={(e) => setFormData({...formData, roles_description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="Décrivez vos rôles spécifiques au sein de l'entreprise..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Missions</label>
                    <textarea 
                      disabled={!isEditing}
                      value={formData.missions}
                      onChange={(e) => setFormData({...formData, missions: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="Quelles sont vos missions principales ?"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Biographie</label>
                    <textarea 
                      disabled={!isEditing}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="Parlez-nous de votre parcours et de votre expertise..."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ 
                          name: user.name || '', 
                          phone: user.phone || '',
                          bio: user.bio || '',
                          missions: user.missions || '',
                          roles_description: user.roles_description || '',
                        });
                        setMessage(null);
                      }}
                      className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      <span>Enregistrer les modifications</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section À Propos du Projet */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <span>À propos de ProManager</span>
        </h3>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed">
            <strong>ProManager</strong> est une plateforme innovante de gestion de chantiers conçue spécifiquement pour répondre aux défis du secteur du BTP au Gabon. Notre mission est de transformer la complexité opérationnelle en une gestion fluide et transparente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Vision Dynamique</h4>
              <p className="text-sm text-slate-600">
                Nous centralisons chaque aspect de vos projets : de la planification des lots à la validation technique des tâches, en passant par une gestion financière rigoureuse.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Innovation Technologique</h4>
              <p className="text-sm text-slate-600">
                Grâce à notre Architecte IA et nos outils de suivi en temps réel, nous permettons aux PME de gagner en productivité et de minimiser les risques de retard.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

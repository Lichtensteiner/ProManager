import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowRight, Plus, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface GeneratedTask {
  name: string;
  durationDays: number;
}

interface GeneratedLot {
  name: string;
  tasks: GeneratedTask[];
}

interface GeneratedProject {
  lots: GeneratedLot[];
}

export default function AIArchitect() {
  const { clients, addProject, addLot, addTask } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [projectMeta, setProjectMeta] = useState({
    name: '',
    clientId: '',
    deadline: '',
    type: 'Bâtiment'
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `En tant qu'expert en gestion de projets BTP au Gabon, génère une structure de lots et de tâches pour le projet suivant : "${prompt}".
        Réponds uniquement au format JSON avec la structure suivante :
        {
          "lots": [
            {
              "name": "Nom du lot (ex: Terrassement)",
              "tasks": [
                { "name": "Nom de la tâche", "durationDays": 5 }
              ]
            }
          ]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          durationDays: { type: Type.NUMBER }
                        },
                        required: ["name", "durationDays"]
                      }
                    }
                  },
                  required: ["name", "tasks"]
                }
              }
            },
            required: ["lots"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setGeneratedProject(data);
      if (projectMeta.name === '') {
        setProjectMeta(prev => ({ ...prev, name: prompt.split(' ').slice(0, 5).join(' ') }));
      }
    } catch (err: any) {
      console.error(err);
      setError("Désolé, l'IA n'a pas pu générer le projet. Veuillez réessayer avec une description plus précise.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      setError("Veuillez vous connecter ou vous inscrire pour enregistrer ce projet.");
      return;
    }
    if (!generatedProject || !projectMeta.clientId || !projectMeta.deadline) {
      setError("Veuillez remplir tous les champs (Client et Date d'échéance).");
      return;
    }

    try {
      // 1. Créer le projet
      const { data: projectData, error: pErr } = await supabase.from('projects').insert([{
        name: projectMeta.name,
        type: projectMeta.type,
        client_id: projectMeta.clientId,
        billing_type: 'FORFAIT',
        deadline: projectMeta.deadline,
        status: 'NOUVEAU',
        progress: 0
      }]).select().single();

      if (pErr) throw pErr;

      // 2. Créer les lots et tâches
      for (const lot of generatedProject.lots) {
        const { data: lotData, error: lErr } = await supabase.from('lots').insert([{
          project_id: projectData.id,
          name: lot.name,
          deadline: projectMeta.deadline, // Simplification
          status: 'A_FAIRE'
        }]).select().single();

        if (lErr) throw lErr;

        const tasksToInsert = lot.tasks.map(t => ({
          lot_id: lotData.id,
          name: t.name,
          deadline: projectMeta.deadline, // Simplification
          status: 'A_FAIRE',
          progress: 0,
          validated_by_dt: false
        }));

        await supabase.from('tasks').insert(tasksToInsert);
      }

      navigate(`/projects/${projectData.id}`);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la création du projet structuré.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Architecte IA</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Décrivez votre projet de construction en quelques mots, et laissez notre IA générer une structure professionnelle de lots et de tâches adaptée au marché gabonais.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description du projet</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Construction d'un immeuble de bureaux R+3 à Akanda, incluant le gros œuvre, l'électricité et la climatisation..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-lg"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Générer la structure du projet</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {generatedProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-slate-100 bg-slate-50/50"
            >
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nom du projet</label>
                    <input
                      type="text"
                      value={projectMeta.name}
                      onChange={e => setProjectMeta({...projectMeta, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Client</label>
                    <select
                      value={projectMeta.clientId}
                      onChange={e => setProjectMeta({...projectMeta, clientId: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date d'échéance finale</label>
                    <input
                      type="date"
                      value={projectMeta.deadline}
                      onChange={e => setProjectMeta({...projectMeta, deadline: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select
                      value={projectMeta.type}
                      onChange={e => setProjectMeta({...projectMeta, type: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Bâtiment">Bâtiment</option>
                      <option value="Route">Route</option>
                      <option value="Hydraulique">Hydraulique</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Structure générée</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {generatedProject.lots.map((lot, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-blue-600 mb-3">{lot.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {lot.tasks.map((task, tIdx) => (
                            <div key={tIdx} className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              <span className="flex-1">{task.name}</span>
                              <span className="text-xs font-medium text-slate-400">{task.durationDays}j</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleCreateProject}
                    className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <span>Créer ce projet structuré</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

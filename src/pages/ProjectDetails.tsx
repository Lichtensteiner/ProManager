import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Plus, CheckCircle, Clock, AlertCircle, Edit2, Trash2, X, List, Calendar as CalendarIcon } from 'lucide-react';
import { Lot } from '../types';
import ProjectTimeline from '../components/ProjectTimeline';

export default function ProjectDetails() {
  const { id } = useParams();
  const { projects, lots, tasks, users, addLot, updateLot, deleteLot, addTask, updateTaskProgress, validateTask, closeLot, closeTask } = useData();
  const { user } = useAuth();

  const project = projects.find(p => p.id === id);
  const projectLots = lots.filter(l => l.projectId === id);

  const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list');
  const [showLotModal, setShowLotModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [showDeleteLotConfirm, setShowDeleteLotConfirm] = useState<string | null>(null);

  const [newLot, setNewLot] = useState({ name: '', deadline: '', engineerIds: [] as string[] });
  const [newTask, setNewTask] = useState({ name: '', deadline: '', engineerIds: [] as string[] });

  if (!project) return <div>Projet non trouvé</div>;

  const canManageLots = user?.role === 'TECH_DIRECTOR' || user?.role === 'ADMIN';
  const canManageTasks = user?.role === 'ENGINEER' || user?.role === 'TECH_DIRECTOR' || user?.role === 'ADMIN';
  const canValidate = user?.role === 'TECH_DIRECTOR' || user?.role === 'ADMIN';

  const handleOpenLotModal = (lot?: Lot) => {
    if (lot) {
      setEditingLot(lot);
      setNewLot({
        name: lot.name,
        deadline: new Date(lot.deadline).toISOString().split('T')[0],
        engineerIds: lot.engineerIds || []
      });
    } else {
      setEditingLot(null);
      setNewLot({ name: '', deadline: '', engineerIds: [] });
    }
    setShowLotModal(true);
  };

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLot) {
      updateLot(editingLot.id, newLot);
    } else {
      addLot({ ...newLot, projectId: project.id });
    }
    setShowLotModal(false);
  };

  const handleDeleteLot = (lotId: string) => {
    deleteLot(lotId);
    setShowDeleteLotConfirm(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({ ...newTask, lotId: selectedLotId });
    setShowTaskModal(false);
    setNewTask({ name: '', deadline: '', engineerIds: [] });
  };

  const engineers = users.filter(u => u.role === 'ENGINEER');

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <Link to="/projects" className="hover:text-blue-600">Projets</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-slate-900 font-medium">{project.name}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-500 mt-1">Échéance: {new Date(project.deadline).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
              <button 
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
                <span>Liste</span>
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'timeline' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Timeline</span>
              </button>
            </div>
            {canManageLots && (
              <button 
                onClick={() => handleOpenLotModal()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau Lot</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'timeline' ? (
        <ProjectTimeline lots={projectLots} tasks={tasks} projectDeadline={project.deadline} />
      ) : (
        /* Lots & Tasks List View */
        <div className="space-y-6">
          {projectLots.map(lot => {
            const lotTasks = tasks.filter(t => t.lotId === lot.id);
            const isLotClosed = lot.status === 'TERMINE';

            return (
              <div key={lot.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <span>{lot.name}</span>
                      {isLotClosed && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">Clôturé</span>}
                    </h2>
                    <p className="text-sm text-slate-500">Échéance: {new Date(lot.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!isLotClosed && canManageTasks && (
                      <button 
                        onClick={() => { setSelectedLotId(lot.id); setShowTaskModal(true); }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter Tâche</span>
                      </button>
                    )}
                    {!isLotClosed && canValidate && (
                      <button 
                        onClick={() => closeLot(lot.id)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Clôturer Lot</span>
                      </button>
                    )}
                    {canManageLots && (
                      <div className="flex items-center space-x-1 border-l border-slate-200 pl-3 ml-1">
                        <button 
                          onClick={() => handleOpenLotModal(lot)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier le lot"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteLotConfirm(lot.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer le lot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-0">
                  {lotTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Tâche</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Échéance</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Statut</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Progression</th>
                            <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lotTasks.map(task => (
                            <tr key={task.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{task.name}</td>
                              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{new Date(task.deadline).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  task.status === 'TERMINE' ? 'bg-emerald-100 text-emerald-800' :
                                  task.status === 'A_VALIDER' ? 'bg-orange-100 text-orange-800' :
                                  task.status === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="range" 
                                    min="0" max="100" 
                                    value={task.progress}
                                    disabled={isLotClosed || task.status === 'TERMINE' || (!canManageTasks && !canValidate)}
                                    onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                                    className="w-24"
                                  />
                                  <span className="text-xs text-slate-500 w-8">{task.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                {task.status === 'A_VALIDER' && canValidate && (
                                  <button 
                                    onClick={() => validateTask(task.id)}
                                    className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded font-medium"
                                  >
                                    Valider
                                  </button>
                                )}
                                {task.validatedByDT && task.status !== 'TERMINE' && canValidate && (
                                  <button 
                                    onClick={() => closeTask(task.id)}
                                    className="text-xs bg-slate-800 text-white hover:bg-slate-700 px-2 py-1 rounded font-medium"
                                  >
                                    Clôturer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      Aucune tâche dans ce lot.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {projectLots.length === 0 && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 border-dashed text-center">
              <p className="text-slate-500">Aucun lot n'a encore été créé pour ce projet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showLotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingLot ? 'Modifier le Lot' : 'Nouveau Lot'}
              </h2>
              <button onClick={() => setShowLotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLot} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du lot</label>
                <input required type="text" value={newLot.name} onChange={e => setNewLot({...newLot, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance</label>
                <input required type="date" value={newLot.deadline} onChange={e => setNewLot({...newLot, deadline: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ingénieurs assignés</label>
                <select multiple value={newLot.engineerIds} onChange={e => {
                  const target = e.target as HTMLSelectElement;
                  setNewLot({...newLot, engineerIds: Array.from(target.selectedOptions, option => option.value)});
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none">
                  {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs.</p>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowLotModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  {editingLot ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteLotConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
              <p className="text-slate-500 text-sm">Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible et supprimera également toutes les tâches associées.</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowDeleteLotConfirm(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button onClick={() => handleDeleteLot(showDeleteLotConfirm)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Nouvelle Tâche</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la tâche</label>
                <input required type="text" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance</label>
                <input required type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ingénieurs assignés</label>
                <select multiple value={newTask.engineerIds} onChange={e => {
                  const target = e.target as HTMLSelectElement;
                  setNewTask({...newTask, engineerIds: Array.from(target.selectedOptions, option => option.value)});
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none">
                  {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

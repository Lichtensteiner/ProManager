import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileText, Plus, Search, Filter, Upload, 
  File, Image as ImageIcon, FileCode, FileArchive,
  MoreVertical, Download, Trash2, ExternalLink,
  Folder, Grid, List as ListIcon, Clock, User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { AppDocument } from '../types';

export default function Documents() {
  const { documents, projects, addDocument, deleteDocument } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'ALL' || d.projectId === projectFilter;
    return matchesSearch && matchesProject;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PLAN': return <FileCode className="w-6 h-6 text-blue-500" />;
      case 'PHOTO': return <ImageIcon className="w-6 h-6 text-emerald-500" />;
      case 'CONTRACT': return <FileText className="w-6 h-6 text-amber-500" />;
      default: return <File className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion Documentaire</h1>
          <p className="text-slate-500">Centralisation des plans, photos et contrats de chantiers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Upload className="w-5 h-5" />
            <span>Téléverser</span>
          </button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="flex-1 md:flex-none bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
          >
            <option value="ALL">Tous les projets</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('GRID')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'GRID' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'LIST' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map(doc => {
            const project = projects.find(p => p.id === doc.projectId);
            return (
              <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                  {getFileIcon(doc.type)}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-600 rounded-lg shadow-sm hover:text-blue-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 truncate mb-1" title={doc.name}>{doc.name}</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-3 truncate">
                    {project?.name || 'Sans projet'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(doc.uploadedAt), 'dd/MM/yy')}
                    </div>
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {doc.uploadedBy.split(' ')[0]}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ouvrir</span>
                  </a>
                  <button 
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Nom</th>
                <th className="px-6 py-4 font-bold">Projet</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Par</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => {
                const project = projects.find(p => p.id === doc.projectId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.type)}
                        <span className="font-bold text-slate-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(doc.uploadedAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Download className="w-5 h-5" />
                        </a>
                        <button onClick={() => deleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredDocs.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Folder className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">Aucun document trouvé</p>
        </div>
      )}

      {/* Upload Modal Stub */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Téléverser un document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addDocument({
                projectId: formData.get('projectId') as string,
                name: formData.get('name') as string,
                type: formData.get('type') as any,
                url: 'https://picsum.photos/seed/doc/800/600', // Mock URL
                uploadedBy: 'Utilisateur Actuel',
                description: formData.get('description') as string
              });
              setShowUploadModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du fichier</label>
                <input name="name" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select name="type" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="PLAN">Plan</option>
                    <option value="PHOTO">Photo</option>
                    <option value="CONTRACT">Contrat / Facture</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Projet</label>
                  <select name="projectId" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner un projet</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optionnel)</label>
                <textarea name="description" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Cliquez ou glissez un fichier ici</p>
                <p className="text-[10px] mt-1">PDF, JPG, PNG (Max 10MB)</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

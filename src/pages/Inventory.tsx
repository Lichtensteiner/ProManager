import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Package, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, 
  History, AlertTriangle, MoreVertical, Edit2, Trash2, Tag, 
  Layers, Box, Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { StockItem, StockMovement } from '../types';

export default function Inventory() {
  const { stockItems, stockMovements, projects, addStockItem, updateStockItem, addStockMovement } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const categories = Array.from(new Set(stockItems.map(i => i.category)));

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = stockItems.filter(i => i.quantity <= i.minQuantity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Stocks</h1>
          <p className="text-slate-500">Suivi des matériaux, outillages et consommables.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel Article</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stockItems.length}</p>
          <p className="text-sm text-slate-500 mt-1">Articles référencés</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Alerte</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{lowStockItems.length}</p>
          <p className="text-sm text-slate-500 mt-1">En rupture ou stock bas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <History className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Activité</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stockMovements.length}</p>
          <p className="text-sm text-slate-500 mt-1">Mouvements enregistrés</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
          >
            <option value="ALL">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Article</th>
                <th className="px-6 py-4 font-bold">Catégorie</th>
                <th className="px-6 py-4 font-bold text-center">Quantité</th>
                <th className="px-6 py-4 font-bold text-center">Unité</th>
                <th className="px-6 py-4 font-bold">Dernière Mise à jour</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Box className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {item.quantity <= item.minQuantity && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> STOCK BAS
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    <span className={cn(
                      item.quantity <= item.minQuantity ? "text-amber-600" : "text-slate-900"
                    )}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 text-sm">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {format(new Date(item.lastUpdated), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => { setSelectedItem(item); setShowMovementModal(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Mouvement de stock"
                      >
                        <Truck className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Package className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Aucun article trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals Stubs */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Nouvel Article</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addStockItem({
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                unit: formData.get('unit') as string,
                quantity: Number(formData.get('quantity')),
                minQuantity: Number(formData.get('minQuantity')),
              });
              setShowAddModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'article</label>
                <input name="name" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <input name="category" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unité</label>
                  <input name="unit" placeholder="ex: kg, sac" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantité Initiale</label>
                  <input name="quantity" type="number" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seuil d'alerte</label>
                  <input name="minQuantity" type="number" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMovementModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Mouvement de stock</h2>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addStockMovement({
                itemId: selectedItem.id,
                type: formData.get('type') as any,
                quantity: Number(formData.get('quantity')),
                projectId: formData.get('projectId') as string || undefined,
                note: formData.get('note') as string,
                performedBy: 'Utilisateur Actuel'
              });
              setShowMovementModal(false);
            }}>
              <p className="text-sm text-slate-500">Article : <span className="font-bold text-slate-900">{selectedItem.name}</span></p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de mouvement</label>
                <select name="type" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="IN">Entrée (Réapprovisionnement)</option>
                  <option value="OUT">Sortie (Utilisation chantier)</option>
                  <option value="ADJUSTMENT">Ajustement (Inventaire)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
                <input name="quantity" type="number" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Projet (Optionnel)</label>
                <select name="projectId" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Aucun projet</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <textarea name="note" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowMovementModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

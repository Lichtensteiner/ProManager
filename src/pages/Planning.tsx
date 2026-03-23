import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Clock, Calendar, Plus, Search, Filter, 
  ChevronLeft, ChevronRight, MoreVertical,
  CheckCircle2, AlertCircle, PlayCircle,
  LayoutGrid, List as ListIcon, GanttChart,
  Briefcase, User, Info
} from 'lucide-react';
import { 
  format, addDays, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameDay, isToday,
  startOfMonth, endOfMonth, isWithinInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function Planning() {
  const { projects, tasks, lots, users } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH' | 'GANTT'>('WEEK');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  const startDate = viewMode === 'WEEK' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
  const endDate = viewMode === 'WEEK' ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredProjects = selectedProjectId === 'ALL' ? projects : projects.filter(p => p.id === selectedProjectId);

  const getTasksForDay = (day: Date, projectId: string) => {
    return tasks.filter(task => {
      const lot = lots.find(l => l.id === task.lotId);
      if (lot?.projectId !== projectId) return false;
      
      // Use the task deadline for planning
      const taskDate = new Date(task.deadline);
      return isSameDay(taskDate, day);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planning & Ordonnancement</h1>
          <p className="text-slate-500">Visualisation et gestion des délais de chantiers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setViewMode('WEEK')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === 'WEEK' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Semaine
            </button>
            <button 
              onClick={() => setViewMode('MONTH')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === 'MONTH' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Mois
            </button>
            <button 
              onClick={() => setViewMode('GANTT')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === 'GANTT' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Gantt
            </button>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 rounded-xl p-1">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'WEEK' ? -7 : -30))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 font-bold text-slate-900 min-w-[150px] text-center">
              {format(currentDate, viewMode === 'WEEK' ? "'Semaine du' dd MMMM" : "MMMM yyyy", { locale: fr })}
            </span>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'WEEK' ? 7 : 30))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="flex-1 md:flex-none bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
          >
            <option value="ALL">Tous les projets</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode !== 'GANTT' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((day, idx) => (
              <div key={idx} className={cn(
                "min-h-[150px] p-2 transition-colors",
                !isSameDay(day, currentDate) && viewMode === 'MONTH' ? "bg-slate-50/30" : "bg-white",
                isToday(day) && "bg-blue-50/20"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <span className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold",
                    isToday(day) ? "bg-blue-600 text-white" : "text-slate-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isToday(day) && <span className="text-[8px] font-bold text-blue-600 uppercase">Aujourd'hui</span>}
                </div>
                
                <div className="space-y-1">
                  {filteredProjects.map(project => {
                    const dayTasks = getTasksForDay(day, project.id);
                    if (dayTasks.length === 0) return null;
                    return (
                      <div key={project.id} className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-[9px] font-bold text-blue-600 truncate uppercase mb-1">{project.name}</p>
                        {dayTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-1 mb-0.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              task.status === 'COMPLETED' ? "bg-emerald-500" : "bg-blue-400"
                            )} />
                            <p className="text-[10px] text-slate-700 truncate">{task.name}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
          <GanttChart className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Vue de Gantt Interactive</h3>
          <p className="max-w-md text-center">
            Cette vue permet de visualiser les dépendances entre les tâches et d'ajuster les délais par glisser-déposer. 
            (Fonctionnalité avancée en cours de déploiement)
          </p>
          <button 
            onClick={() => setViewMode('WEEK')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Retour au Calendrier
          </button>
        </div>
      )}

      {/* Legend & Info */}
      <div className="flex flex-wrap gap-6 items-center text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>Tâche en cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span>Tâche terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span>Retard potentiel</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-blue-600 font-medium">
          <Info className="w-4 h-4" />
          <span>Cliquez sur un jour pour ajouter une tâche</span>
        </div>
      </div>
    </div>
  );
}

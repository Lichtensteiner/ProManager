import React from 'react';
import { Lot, Task } from '../types';
import { format, addDays, startOfDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectTimelineProps {
  lots: Lot[];
  tasks: Task[];
  projectDeadline: string;
}

export default function ProjectTimeline({ lots, tasks, projectDeadline }: ProjectTimelineProps) {
  const startDate = lots.length > 0 
    ? new Date(Math.min(...lots.map(l => new Date(l.deadline).getTime())) - (30 * 24 * 60 * 60 * 1000))
    : new Date();
  
  const endDate = new Date(projectDeadline);
  const totalDays = Math.max(differenceInDays(endDate, startDate), 60);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Planning du Projet</h3>
        <p className="text-sm text-slate-500">Vue chronologique des lots et tâches</p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-6">
          {/* Timeline Header (Months) */}
          <div className="flex border-b border-slate-100 mb-4 pb-2">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex-1 flex relative h-6">
              {Array.from({ length: Math.ceil(totalDays / 30) + 1 }).map((_, i) => {
                const monthDate = addDays(startDate, i * 30);
                return (
                  <div 
                    key={i} 
                    className="absolute text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    style={{ left: `${(i * 30 / totalDays) * 100}%` }}
                  >
                    {format(monthDate, 'MMM yyyy', { locale: fr })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lots Rows */}
          <div className="space-y-6">
            {lots.map(lot => {
              const lotTasks = tasks.filter(t => t.lotId === lot.id);
              const lotStart = startDate; // Simplified
              const lotEnd = new Date(lot.deadline);
              const startOffset = (differenceInDays(lotStart, startDate) / totalDays) * 100;
              const width = (differenceInDays(lotEnd, lotStart) / totalDays) * 100;

              return (
                <div key={lot.id} className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <span className="text-sm font-bold text-slate-700 truncate block">{lot.name}</span>
                    </div>
                    <div className="flex-1 h-6 bg-slate-50 rounded-full relative overflow-hidden">
                      <div 
                        className="absolute h-full bg-blue-500/20 border border-blue-200 rounded-full"
                        style={{ left: `${Math.max(0, startOffset)}%`, width: `${Math.max(2, width)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tasks in Lot */}
                  <div className="space-y-1">
                    {lotTasks.map(task => {
                      const taskEnd = new Date(task.deadline);
                      const taskStart = addDays(taskEnd, -7); // Mock start for visualization
                      const tStartOffset = (differenceInDays(taskStart, startDate) / totalDays) * 100;
                      const tWidth = (differenceInDays(taskEnd, taskStart) / totalDays) * 100;

                      return (
                        <div key={task.id} className="flex items-center">
                          <div className="w-48 flex-shrink-0 pr-4 pl-4">
                            <span className="text-xs text-slate-500 truncate block">{task.name}</span>
                          </div>
                          <div className="flex-1 h-3 relative">
                            <div 
                              className={`absolute h-full rounded-full ${
                                task.status === 'TERMINE' ? 'bg-emerald-500' : 
                                task.status === 'EN_COURS' ? 'bg-blue-500' : 'bg-slate-300'
                              }`}
                              style={{ left: `${Math.max(0, tStartOffset)}%`, width: `${Math.max(1, tWidth)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
          <span className="text-xs text-slate-500">À faire</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-slate-500">En cours</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-xs text-slate-500">Terminé</span>
        </div>
      </div>
    </div>
  );
}

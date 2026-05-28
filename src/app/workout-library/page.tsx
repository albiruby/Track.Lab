'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { workoutTemplates } from '@/data_pack/workoutTemplates';

export default function WorkoutLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Library</h1>
        <p className="text-zinc-600 dark:text-zinc-400">View static structured interval templates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutTemplates.map(template => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="capitalize">{template.scenario.replace('_', ' ')} • {template.difficulty.replace('_', ' ')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 text-sm">
                
                {('warmup' in template) && template.warmup && (
                  <div>
                    <span className="text-zinc-500 font-medium">Warmup: </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {'minutes' in template.warmup ? `${template.warmup.minutes} min` : `${(template.warmup as any).distanceMeters}m`} @ {(template.warmup as any).intensity}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 font-medium pb-1 block">Main Set:</span>
                  {'reps' in (('mainSet' in template ? template.mainSet : {}) || {}) ? (
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                      {('mainSet' in template ? (template.mainSet as any).reps : '')} × {('mainSet' in template && 'distanceMeters' in (template.mainSet as any)) ? `${(template.mainSet as any).distanceMeters}m` : ('mainSet' in template ? `${(template.mainSet as any).durationMinutes} min` : '')} @ {('mainSet' in template ? (template.mainSet as any).intensity : '')}
                    </div>
                  ) : ('segments' in template) && template.segments ? (
                    <div className="space-y-1">
                      {(template.segments as any).map((seg: any, i: number) => (
                        <div key={i} className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                           {'distanceMeters' in seg ? `${seg.distanceMeters}m` : `${seg.durationMinutes} min`} @ {seg.intensity}
                        </div>
                      ))}
                    </div>
                  ) : ('sessions' in template) && template.sessions ? (
                    <div className="space-y-2">
                       {(template.sessions as any).map((sess: any, i: number) => (
                         <div key={i}>
                           <div className="font-semibold text-xs text-zinc-500 mb-1">{sess.label} Session</div>
                           <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                            {sess.mainSet.reps} × {sess.mainSet.distanceMeters ? `${sess.mainSet.distanceMeters}m` : `${sess.mainSet.durationMinutes} min`} @ {sess.mainSet.intensity}
                           </div>
                         </div>
                       ))}
                    </div>
                  ) : ('mainSet' in template) && template.mainSet ? (
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                      {'distanceMeters' in (template.mainSet as any) ? `${(template.mainSet as any).distanceMeters}m` : `${(template.mainSet as any).durationMinutes} min`} @ {(template.mainSet as any).intensity}
                    </div>
                  ) : null}
                </div>

                {('cooldown' in template) && template.cooldown && (
                  <div>
                    <span className="text-zinc-500 font-medium">Cooldown: </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {'minutes' in template.cooldown ? `${template.cooldown.minutes} min` : `${(template.cooldown as any).distanceMeters}m`} @ {(template.cooldown as any).intensity}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

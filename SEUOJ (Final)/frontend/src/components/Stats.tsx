import { Users, FileCode, CheckCircle, Trophy } from 'lucide-react';

export default function Stats() {
  const statList = [
    { label: 'Active Programmers', value: '1,250+', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Submissions Evaluated', value: '45,000+', icon: FileCode, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Practice Problems', value: '350+', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Contests Completed', value: '18', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <section className="bg-white border-y border-slate-200/80 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {statList.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
              <div className={`${stat.color} p-3.5 rounded-2xl flex items-center justify-center shadow-sm`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900 block tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Cpu, Trophy, Terminal, Shield, Bell, LineChart } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      title: 'Sandboxed Judging (Judge0)',
      description: 'Run submissions securely on isolated Judge0 CE sandboxes, supporting strict execution thresholds.',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Tiered Rank Leaderboards',
      description: 'Gain points, compete with classmates, and track academic divisions with real-time rating updates.',
      icon: Trophy,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Mock Cloud Editor',
      description: 'Examine constraints, input/output layouts, and test code against preloaded samples directly in-browser.',
      icon: Terminal,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Administrative Control',
      description: 'Enforce platform integrity using granular suspension settings, problem visible toggles, and logs.',
      icon: Shield,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Contest Metrics Charting',
      description: 'Review interactive submissions tracking, solve trends, and difficulty counts on personal dashboards.',
      icon: LineChart,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Instant Alerts system',
      description: 'Receive immediate notifications when contests are scheduled, reports are answered, or admins post updates.',
      icon: Bell,
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <section id="problems" className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-left">
      
      {/* Section Headers */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-2">Feature Rich Architecture</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
          Everything You Need to Master Competitive Programming
        </h2>
        <p className="text-slate-500 font-medium">
          SEUOJ couples Spring Security role divisions with the robust sandbox capabilities of Judge0 to provide a premium classroom experience.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 group text-left"
            >
              <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
}

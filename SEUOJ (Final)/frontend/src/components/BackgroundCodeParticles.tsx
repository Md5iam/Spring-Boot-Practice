import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  text: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
  scale: string;
}

export default function BackgroundCodeParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const tokens = [
      '</>', '{ }', 'if (x > y)', 'while (true)', 'print()', 
      'const', 'int main()', 'return 0;', 'import java.util.*;',
      'def solve():', 'std::cout', '#include', 'for i in range:', 
      'boolean solved', 'double timeLimit', 'public class', 'struct Node'
    ];

    const generated = Array.from({ length: 18 }).map((_, idx) => {
      const text = tokens[idx % tokens.length];
      const left = `${Math.random() * 95}%`;
      const top = `${Math.random() * 90 + 5}%`;
      const delay = `${Math.random() * 5}s`;
      const duration = `${15 + Math.random() * 20}s`; // slow lazy float
      const scale = `${0.85 + Math.random() * 0.4}`;

      return {
        id: idx,
        text,
        left,
        top,
        delay,
        duration,
        scale,
      };
    });

    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 select-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-mono text-[11px] md:text-sm font-extrabold text-blue-600/10 dark:text-blue-500/[0.04] animate-float whitespace-nowrap"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `scale(${p.scale})`,
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

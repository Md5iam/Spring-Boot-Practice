import { useEffect, useRef } from 'react';

interface Props { isLanding?: boolean; }

export default function BackgroundCodeParticles({ isLanding = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const SNIPPETS = [
      'DP[I][J]', 'SHA-256', 'O(LOG N)', 'MAX_FLOW()', 'ASYNC/AWAIT',
      'PRIORITY_QUEUE', 'BFS(GRAPH)', 'SORT(ARR)', 'DIJKSTRA()',
      'FFT(SIGNAL)', 'MATRIX[N][M]', 'HASH_MAP<K,V>', 'BINARY_SEARCH()',
      'DFS(NODE)', 'MERGE_SORT()', 'KNAPSACK(W,V)', 'MST_KRUSKAL()',
      'TOPOLOGICAL(G)', 'FLOYD_WARSHALL()', 'LCS(A,B)', 'SEGMENT_TREE()',
      'FENWICK_TREE()', 'TRIE_INSERT()', 'BELLMAN_FORD()', 'A_STAR(GOAL)',
      '#INCLUDE<BITS>', 'STD::SORT()', 'INT MAIN()', 'RETURN 0;',
      'VECTOR<INT>', 'PAIR<INT,INT>', 'FOR I IN RANGE(N):', 'DEP_SOLVE()',
    ];

    const floaters = SNIPPETS.map(text => ({
      text,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.28,
      opacity: isLanding ? (0.13 + Math.random() * 0.09) : (0.045 + Math.random() * 0.065),
      size: isLanding ? (11 + Math.random() * 5) : (9.5 + Math.random() * 4),
    }));

    const NODE_COUNT = 26;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.35,
      r: 2 + Math.random() * 2.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    const GRID = 52;

    const landing = isLanding;

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);

      // Grid
      ctx!.strokeStyle = landing ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.05)';
      ctx!.lineWidth = 0.5;
      for (let x = 0; x < W; x += GRID) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y < H; y += GRID) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }

      // Node connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(59,130,246,${(landing ? 0.4 : 0.12) * (1 - d / 180)})`;
            ctx!.lineWidth = 0.7;
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        n.pulse += 0.02;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const pf = 0.8 + 0.3 * Math.sin(n.pulse);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r * pf, 0, Math.PI * 2);
        ctx!.fillStyle = landing
          ? `rgba(59,130,246,${0.65 + 0.15 * Math.sin(n.pulse)})`
          : `rgba(59,130,246,${0.35 + 0.15 * Math.sin(n.pulse)})`;
        ctx!.fill();
      });

      // Code snippets
      floaters.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < -200) f.x = W + 5;
        if (f.x > W + 200) f.x = -5;
        if (f.y < -20) f.y = H + 5;
        if (f.y > H + 20) f.y = -5;
        ctx!.font = `500 ${f.size}px 'Fira Code', 'Courier New', monospace`;
        ctx!.fillStyle = `rgba(30,58,138,${f.opacity})`;
        ctx!.fillText(f.text, f.x, f.y);
      });

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isLanding]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}

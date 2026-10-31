import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleCanvasHandle {
  burst: (x: number, y: number, colors?: string[]) => void;
}

export const ParticleBurstCanvas = forwardRef<ParticleCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }>
  >([]);
  const animFrameId = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    burst: (clientX: number, clientY: number, colors = ['#FF6363', '#F59E0B', '#38BDF8', '#CBA6F7']) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const originX = clientX - rect.left;
      const originY = clientY - rect.top;

      // Spawn 12 micro particles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 3.2;
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.035 + Math.random() * 0.035,
        });
      }

      if (!animFrameId.current) {
        loop();
      }
    },
  }));

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        alive = true;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Remove dead particles
    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

    if (alive) {
      animFrameId.current = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFrameId.current = null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
});

ParticleBurstCanvas.displayName = 'ParticleBurstCanvas';

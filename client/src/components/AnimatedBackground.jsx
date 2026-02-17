/**
 * AnimatedBackground Component
 * Creates animated particles and aurora effects for the background
 */

import React, { useEffect, useRef } from 'react';
import '../styles/AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    let particles = [];

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = this.getColor();
      }

      getColor() {
        const colors = [
          { r: 99, g: 102, b: 241 },   // indigo
          { r: 129, g: 140, b: 248 },  // light indigo
          { r: 139, g: 92, b: 246 },   // purple
          { r: 167, g: 139, b: 250 },  // light purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.opacity = 0.3 + Math.sin(time * 2 + this.x * 0.01) * 0.2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw aurora waves
    const drawAurora = () => {
      const layers = 3;
      
      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        const amplitude = 120 + layer * 40;
        const frequency = 0.002 - layer * 0.0003;
        const phase = time * (0.3 + layer * 0.15);
        const yOffset = canvas.height * (0.4 + layer * 0.1);

        for (let x = 0; x <= canvas.width; x += 10) {
          const y = Math.sin(x * frequency + phase) * amplitude + 
                    Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude / 2) + 
                    yOffset;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const colors = [
          { r: 99, g: 102, b: 241, a: 0.08 },   // indigo
          { r: 139, g: 92, b: 246, a: 0.06 },   // purple
          { r: 129, g: 140, b: 248, a: 0.05 }   // light indigo
        ];
        
        const gradient = ctx.createLinearGradient(0, yOffset - amplitude, 0, canvas.height);
        gradient.addColorStop(0, `rgba(${colors[layer].r}, ${colors[layer].g}, ${colors[layer].b}, ${colors[layer].a})`);
        gradient.addColorStop(1, `rgba(${colors[layer].r}, ${colors[layer].g}, ${colors[layer].b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Draw connections between nearby particles
    const drawConnections = () => {
      const maxDistance = 150;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawAurora();
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      drawConnections();
      
      time += 0.01;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} className="waves-canvas" />
      
      {/* Floating geometric shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Gradient overlay */}
      <div className="gradient-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;

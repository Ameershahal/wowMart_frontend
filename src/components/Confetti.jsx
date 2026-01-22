import { useEffect, useState } from 'react'

function Confetti({ trigger, onComplete }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (trigger) {
      const newParticles = []
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FFA500', '#FF69B4']
      
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5,
          duration: 1.5 + Math.random() * 0.5,
          size: 3 + Math.random() * 3
        })
      }
      
      setParticles(newParticles)
      
      const timer = setTimeout(() => {
        setParticles([])
        if (onComplete) onComplete()
      }, 2500)
      
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (particles.length === 0) return null

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s forwards`,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

export default Confetti

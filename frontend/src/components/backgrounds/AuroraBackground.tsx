export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          width: "70vw",
          height: "70vw",
          top: "-20vw",
          left: "-10vw",
          background:
            "radial-gradient(ellipse at center, rgba(34,211,238,0.13) 0%, rgba(34,211,238,0.05) 45%, transparent 70%)",
          animation: "auroraBlob1 14s ease-in-out infinite alternate",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "55vw",
          height: "55vw",
          bottom: "-15vw",
          right: "-5vw",
          background:
            "radial-gradient(ellipse at center, rgba(212,232,74,0.1) 0%, rgba(212,232,74,0.04) 45%, transparent 70%)",
          animation: "auroraBlob2 18s ease-in-out infinite alternate",
          filter: "blur(70px)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "45vw",
          height: "45vw",
          top: "30%",
          left: "35%",
          background:
            "radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.03) 50%, transparent 70%)",
          animation: "auroraBlob3 22s ease-in-out infinite alternate",
          filter: "blur(80px)",
          borderRadius: "50%",
        }}
      />
      <style>{`
        @keyframes auroraBlob1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(8vw, 5vh) scale(1.15); }
          100% { transform: translate(-4vw, 10vh) scale(0.92); }
        }
        @keyframes auroraBlob2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-6vw, -8vh) scale(1.2); }
          100% { transform: translate(4vw, -4vh) scale(0.88); }
        }
        @keyframes auroraBlob3 {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          50%  { transform: translate(5vw, 6vh) scale(1.1) rotate(15deg); }
          100% { transform: translate(-3vw, -5vh) scale(0.95) rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}

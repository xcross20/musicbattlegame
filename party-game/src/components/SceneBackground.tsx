export default function SceneBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Animated gradient base */}
      <div className="absolute inset-0 bg-animated-gradient" />

      {/* Floating orbs */}
      <div
        className="orb orb-purple w-[500px] h-[500px] -top-40 -left-40 animate-orb-drift"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="orb orb-blue w-[400px] h-[400px] top-1/3 -right-32 animate-orb-drift"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="orb orb-pink w-[350px] h-[350px] -bottom-20 left-1/4 animate-orb-drift"
        style={{ animationDelay: '-13s' }}
      />

      {/* Subtle noise overlay */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}

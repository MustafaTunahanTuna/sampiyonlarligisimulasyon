export function StarballBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="starfield absolute inset-0 opacity-45" />
      <img
        src="/starball.webp"
        alt=""
        fetchPriority="low"
        className="neon-image absolute -right-[22vw] -top-[8vh] w-[78vw] max-w-[56rem] opacity-55 sm:-right-[12vw] sm:w-[56vw]"
      />
      <img
        src="/starball.webp"
        alt=""
        fetchPriority="low"
        className="neon-image absolute left-1/2 top-1/2 w-[70vw] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 opacity-15"
      />
      <img
        src="/starball.webp"
        alt=""
        fetchPriority="low"
        className="neon-image absolute -left-[26vw] bottom-[-6vh] w-[62vw] max-w-[44rem] opacity-30 sm:-left-[16vw]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-canvas/40 via-canvas/70 to-canvas/85" />
    </div>
  )
}

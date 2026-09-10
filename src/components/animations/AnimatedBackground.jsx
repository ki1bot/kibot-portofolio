export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.11), transparent 38%)",
          "radial-gradient(circle at 50% 100%, rgba(37, 99, 235, 0.11), transparent 42%)",
          "radial-gradient(circle at 100% 35%, rgba(34, 211, 238, 0.07), transparent 32%)",
          "radial-gradient(circle at 0% 42%, rgba(139, 92, 246, 0.09), transparent 34%)",
        ].join(", "),
      }}
    />
  );
}

function NodeCard({ pos }: { pos: { x: number; y: number } }) {
  return (
    <div
      className="absolute bg-red-400 rounded-xl"
      style={{
        transform: `translate(${pos.y}px,${pos.x}px)`,
        height: '200px',
        width: '400px',
      }}
    />
  );
}

export default NodeCard;

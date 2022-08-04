function Link({
  from,
  target,
  linkData,
}: {
  from: any;
  target: any;
  linkData: any;
}) {
  const midpoint = [
    (from.x + target.x) / 2 - (from.data.type === 'branch' ? 120 : 55),
    (from.y + target.y) / 2 - (from.data.type === 'branch' ? 70 : 15),
  ];
  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${midpoint[1]}px,${midpoint[0]}px)`,
      }}
    ></div>
  );
}

export default Link;

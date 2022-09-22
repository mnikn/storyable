import classNames from 'classnames';
import { SchemaFieldBoolean } from 'renderer/models/schema/schema';

function FieldBoolean({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
  label?: string;
  schema: SchemaFieldBoolean;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  return (
    <div className={classNames('w-full flex flex-col items-center', className)}>
      {label && <div className="text-sm font-bold mb-5">{label}</div>}
      <input
        className="w-full accent-blue-300 focus:ring-blue-500 outline-none cursor-pointer transition-all"
        type="checkbox"
        checked={value}
        onChange={(e) => {
          if (onValueChange) {
            onValueChange(e.target.checked);
          }
        }}
      />
    </div>
  );
}

export default FieldBoolean;

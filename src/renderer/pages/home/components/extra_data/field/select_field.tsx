import { SchemaFieldSelect } from 'renderer/models/schema/schema';
import Select, { components } from 'react-select';

function FieldSelect({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldSelect;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.value);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {label && <div className="text-sm font-bold mb-2">{label}</div>}
      <Select
        className="text-sm block outline-none cursor-pointer w-full"
        value={schema.config.options.find((d) => d.value === value)}
        onChange={onChange}
        options={schema.config.options}
      />
    </div>
  );
}

export default FieldSelect;

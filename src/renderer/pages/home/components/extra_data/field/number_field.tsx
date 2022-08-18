import { useEffect, useState } from 'react';
import { SchemaFieldNumber } from 'renderer/models/schema/schema';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';

function FieldNumber({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldNumber;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const [valueText, setValueText] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    setValueText(
      schema.config.prefix +
        (typeof value !== 'undefined' ? String(value) : '') +
        schema.config.suffix
    );
  }, [value, schema]);

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let textValue = e.target.value
      .replace(schema.config.suffix, '')
      .replace(schema.config.prefix, '');

    if (textValue === '') {
      setValueText(
        schema.config.prefix + schema.config.defaultValue + schema.config.suffix
      );
    }

    if (!/^[+-]?\d*(\.\d*)?$/.test(textValue)) {
      return;
    }

    const realValue = Number(textValue);
    setValueText(schema.config.prefix + textValue + schema.config.suffix);

    if (schema.config.required && !realValue) {
      setErrorText('Number cannot be empty');
      return;
    }
    if (realValue < schema.config.min) {
      setErrorText(`Number must more than ${schema.config.min}`);
      return;
    }
    if (realValue > schema.config.max) {
      setErrorText(`Number must less than ${schema.config.max}`);
      return;
    }
    if (schema.config.type === 'int' && !Number.isInteger(realValue)) {
      setErrorText(`Number must be integer`);
      return;
    }
    if (schema.config.customValidate) {
      /* no-warn=eval */
      const fn = eval(schema.config.customValidate || '');
      if (fn) {
        const success = fn(realValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange && !Number.isNaN(realValue)) {
      onValueChange(Number(realValue));
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {label && <div className="text-sm font-bold mb-2">{label}</div>}
      <input
        className="text-sm font-normal w-full outline-none border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={valueText}
        onChange={onTextChange}
      />
      <div className="absoulte bottom-0">
        {errorText && (
          <div className="error text-rose-500 text-sm">{errorText}</div>
        )}
      </div>
    </div>
  );
}

export default FieldNumber;

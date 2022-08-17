import { useEffect, useState } from 'react';
import { SchemaFieldString } from 'renderer/models/schema/schema';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';

function FieldString({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldString;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const currentLang = useEventState<any>({
    event: StoryProvider.event,
    property: 'currentLang',
    initialVal: StoryProvider.currentLang,
  });
  const translations = useEventState<any>({
    event: StoryProvider.event,
    property: 'translations',
    initialVal: StoryProvider.translations,
  });

  const [contentValue, setContentValue] = useState(
    schema.config.needI18n ? translations[value]?.[currentLang] || '' : value
  );

  useEffect(() => {
    setContentValue(
      schema.config.needI18n ? translations[value]?.[currentLang] || '' : value
    );
  }, [currentLang, translations, value]);

  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setContentValue(textValue);
    if (schema.config.required && !textValue) {
      setErrorText('Text cannot be empty');
      return;
    }
    if (textValue.length < schema.config.minLen) {
      setErrorText(`Text length must more than ${schema.config.minLen}`);
      return;
    }
    if (textValue.length > schema.config.maxLen) {
      setErrorText(`Text length must less than ${schema.config.maxLen}`);
      return;
    }
    if (schema.config.customValidate) {
      const fn = eval(schema.config.customValidate);
      if (fn) {
        const success = fn(textValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange) {
      if (!schema.config.needI18n) {
        onValueChange(textValue);
      }
    }

    const termKey = value;
    if (schema.config.needI18n) {
      StoryProvider.updateTranslateKey(termKey, textValue);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {label && <div className="text-sm font-bold mb-2">{label}</div>}
      {schema.config.type === 'singleline' && (
        <input
          className="text-sm font-normal w-full outline-none border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={contentValue}
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'multiline' && (
        <textarea
          className="resize-none text-sm font-normal w-full outline-none border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={contentValue}
          onChange={onTextChange}
          style={{
            height: schema.config.height,
          }}
        />
      )}
      {/* <div className="bottom">
          {errorText && <div className="error">{errorText}</div>}
          </div> */}
    </div>
  );
}

export default FieldString;

import { useEffect, useState } from 'react';
import { SchemaFieldString } from 'renderer/models/schema/schema';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';
import MonacoEditor from 'react-monaco-editor';
import { get, uniq } from 'lodash';
import classNames from 'classnames';

const CodeFieldSchema = new SchemaFieldString();

const Editor = ({
  schema,
  contentValue,
  onValueChange,
}: {
  schema: SchemaFieldString;
  contentValue: any;
  onValueChange?: (value: any) => void;
}) => {
  const fields = uniq(
    (schema.config.template || '')
      .match(/(\{{2}\w*\}{2})/g)
      ?.map((item) => item.substring(2, item.length - 2)) || []
  );

  let finalValue = !schema.config.template
    ? contentValue.value
    : schema.config.template || '';
  if (schema.config.template) {
    fields.forEach((f) => {
      finalValue = finalValue.replaceAll(
        `{{${f}}}`,
        contentValue.fields[f] || `{{${f}}}`
      );
    });
  }

  return (
    <div className="flex w-full">
      <MonacoEditor
        width="100%"
        height={schema.config.height}
        language={schema.config.codeLang}
        theme="vs-dark"
        value={finalValue}
        options={{
          readOnly: !!schema.config.template,
        }}
        onChange={(v) => {
          if (onValueChange) {
            onValueChange({
              fields: [],
              value: v,
            });
          }
        }}
      />
      {fields.length > 0 && (
        <div className="flex flex-col ml-2">
          {fields.map((f) => {
            return (
              <FieldString
                label={f}
                schema={CodeFieldSchema}
                value={contentValue.fields[f] || ''}
                onValueChange={(v) => {
                  if (onValueChange) {
                    onValueChange({
                      fields: { ...contentValue.fields, [f]: v },
                      value: (schema.config.template || '').replaceAll(
                        `{{${f}}}`,
                        v
                      ),
                    });
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

function FieldString({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
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

  console.log('reerv: ', schema.config);
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
    <div className={classNames('w-full flex flex-col items-center', className)}>
      {label && <div className="text-sm font-bold mb-3">{label}</div>}
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
      {schema.config.type === 'code' && (
        <Editor
          schema={schema}
          contentValue={contentValue}
          onValueChange={(v) => {
            setContentValue(v);
            if (onValueChange) {
              onValueChange(v);
            }
          }}
        />
      )}
      <div className="absoulte bottom-0">
        {errorText && (
          <div className="error text-rose-500 text-sm">{errorText}</div>
        )}
      </div>
    </div>
  );
}

export default FieldString;

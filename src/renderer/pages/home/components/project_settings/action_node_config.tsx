import { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { DEFAULT_CONFIG } from 'renderer/models/schema/schema';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from '../../../../services/story_provider';

const OBJ_JSON = {
  type: 'object',
  fields: {},
  config: DEFAULT_CONFIG.OBJECT_CONFIG_DEFAULT,
};
const STR_JSON = {
  type: 'string',
  config: DEFAULT_CONFIG.STRING_CONFIG_DEFAULT,
};
const BOOLEAN_JSON = {
  type: 'boolean',
  config: DEFAULT_CONFIG.BOOLEAN_CONFIG_DEFAULT,
};
const NUM_JSON = {
  type: 'number',
  config: DEFAULT_CONFIG.NUMBER_CONFIG_DEFAULT,
};
const SELECT_JSON = {
  type: 'select',
  config: DEFAULT_CONFIG.SELECT_CONFIG_DEFAULT,
};
const ARR_JSON = {
  type: 'array',
  fieldSchema: null,
  config: DEFAULT_CONFIG.ARRAY_CONFIG_DEFAULT,
};

function ActionNodeConfigPanel({ close }: { close: () => void }) {
  const [editor, setEditor] = useState<any>(null);
  const projectSettings = useEventState<any>({
    event: StoryProvider.event,
    property: 'projectSettings',
    initialVal: StoryProvider.projectSettings,
  });
  const [config, setConfig] = useState<string>('');

  useEffect(() => {
    const str = JSON.stringify(projectSettings?.actionNodeConfig || [], null, 4);
    setConfig(str);
  }, [projectSettings]);

  const editorDidMount = (editorVal: any, monaco: any) => {
    setEditor(editorVal);

    const createDependencyProposals = (range) => {
      const fieldObj = {
        your_field: {
          name: 'your_field',
          config: {},
        },
      };
      const formatInnerField = (obj: any) => {
        const objStr = JSON.stringify(obj, null, 2);
        return objStr.substring(1, objStr.length - 1);
      };
      let snippets = [
        {
          label: 'object',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(OBJ_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'array',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(ARR_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'string',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(STR_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'boolean',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(BOOLEAN_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'number',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(NUM_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'select',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(SELECT_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'numberField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...NUM_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'stringField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...STR_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'booleanField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...BOOLEAN_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'selectField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...SELECT_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'arrayField', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...ARR_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'objectField', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...OBJ_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'field', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField(fieldObj), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
      ];
      return snippets;
    };

    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model, position) => {
        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: createDependencyProposals(range),
        };
      },
    });
  };

  return (
    <div className="block p-6 flex flex-col flex-grow">
      <div className="p-2 mb-4 flex-grow flex">
        <MonacoEditor
          width="100%"
          height="100%"
          language="json"
          theme="vs-dark"
          value={config}
          onChange={(val) => {
            setConfig(val);
          }}
          editorDidMount={editorDidMount}
        />
      </div>
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            projectSettings.actionNodeConfig = JSON.parse(config);
            StoryProvider.updateProjectSettings(projectSettings);
            close();
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ActionNodeConfigPanel;

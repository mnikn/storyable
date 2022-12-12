import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'react-contexify/dist/ReactContexify.css';
import Home from './pages/home';

import { monaco } from 'react-monaco-editor';

const createDependencyProposals = (range) => {
  let snippets = [
    {
      label: 'nhs',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'tracker nhs',
      insertText: 'tracker.nhs(context.current_process_node.id)',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: 'cnhs',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'tracker cnhs',
      insertText: 'tracker.cnhs("${1:storyletId}", "${1:customNodeId}")',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: 'shs',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'tracker cnhs',
      insertText: 'tracker.shs("${1:storyletId}")',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: 'lht',
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: 'tracker lht',
      insertText:
        'tracker.lht(context.current_process_node.sourceId, context.current_process_node.targetId)',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
  return snippets;
};

monaco.languages.registerCompletionItemProvider('plaintext', {
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

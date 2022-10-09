import MonacoEditor from 'react-monaco-editor';

function SentenceNodePopup({ nodeData }) {
  if (
    !nodeData.data.onJumpProcess &&
    !nodeData.data.afterJumpProcess &&
    !nodeData.data.enableCheck
  ) {
    return null;
  }
  return (
    <div
      className="bg-gray-50 rounded-md p-4 flex transition-all absolute"
      style={{
        height: '500px',
        top: -650,
        left: '50%',
        transform: 'translate(-50%)',
      }}
    >
      {nodeData.data.onJumpProcess && (
        <div className="flex flex-col mr-12 items-center">
          <div className="text-3xl text-black mb-2 font-bold">
            On Jump process
          </div>
          <MonacoEditor
            className="block flex-shrink-0"
            width="800px"
            height="400px"
            theme="vs-dark"
            value={nodeData.data.onJumpProcess}
            options={{
              readOnly: true,
              selectOnLineNumbers: true,
              fontSize: 26,
            }}
            editorDidMount={(editor) => {
              setTimeout(() => {
                editor.layout();
                editor.focus();
              }, 0);
            }}
          />
        </div>
      )}
      {nodeData.data.afterJumpProcess && (
        <div className="flex flex-col mr-12 items-center">
          <div className="text-3xl text-black mb-2 font-bold">
            After Jump process
          </div>
          <MonacoEditor
            className="block flex-shrink-0"
            width="800px"
            height="400px"
            theme="vs-dark"
            value={nodeData.data.afterJumpProcess}
            options={{
              readOnly: true,
              selectOnLineNumbers: true,
              fontSize: 26,
            }}
            editorDidMount={(editor) => {
              setTimeout(() => {
                editor.layout();
                editor.focus();
              }, 0);
            }}
          />
        </div>
      )}
      {nodeData.data.enableCheck && (
        <div className="flex flex-col items-center">
          <div className="text-3xl text-black mb-2 font-bold">Enable check</div>
          <MonacoEditor
            className="block flex-shrink-0"
            width="800px"
            height="400px"
            theme="vs-dark"
            value={nodeData.data.enableCheck}
            options={{
              readOnly: true,
              selectOnLineNumbers: true,
              fontSize: 26,
            }}
            editorDidMount={(editor) => {
              setTimeout(() => {
                editor.layout();
                editor.focus();
              }, 0);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default SentenceNodePopup;

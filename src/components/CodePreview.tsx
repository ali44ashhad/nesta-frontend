import React from 'react';

interface CodePreviewProps {
  code: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  return (
    <div className="h-full p-4 overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Arduino Code</h3>
        <button
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
        >
          Copy Code
        </button>
      </div>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-auto h-[calc(100%-4rem)]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodePreview; 
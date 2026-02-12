import React from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';

export const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <Editor />
      <main className="flex-1 h-full overflow-hidden">
        <Preview />
      </main>
    </div>
  );
};

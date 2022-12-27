import { useEffect } from 'react';

export default function ImportingPage() {
  useEffect(() => {
    async function startImport() {
      await window.fileAPI.importSelectedChats();
    }
    startImport();

    console.log('hello');
  });

  // To hook up with backend code that processes files
  return <div>Importing...</div>;
}

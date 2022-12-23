// import { Link } from 'react-router-dom';
import { useState } from "react";

export default function UploadFilePage({ chatPlatform, chatFilePath, chooseChatFile }) {

const [chatNames, setChatNames] = useState(['']);

async function handleSelectFile() {
  chooseChatFile(await window.fileAPI.chooseFile());
}

async function handleUploadClick() {
  setChatNames(await window.fileAPI.processFile());
}

  return (
    <div>
      <h1> Import your {chatPlatform} chat file</h1>
      <button onClick={handleSelectFile} type="button">Select a Chat File to Import</button>

      <p>Do you want to import this chat file: {chatFilePath}? </p>
      <button onClick={handleUploadClick} type="button">Import</button>
      <ul>
        {chatNames.map((chatName) => (
          <li key={chatName}>{chatName}</li>
        ))}
      </ul>
      <h3> Help! How do I get my chat file?</h3>
    </div>
  );
}

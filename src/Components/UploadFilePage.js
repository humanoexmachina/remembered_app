// import { Link } from 'react-router-dom';

import { useState } from "react";

// TODO: Add state to pass the chatPlatform information
export default function UploadFilePage({ chatPlatform }) {

const [chatNames, setChatNames] = useState(['no-path']);

async function handleUploadClick() {
  setChatNames(await window.fileAPI.processFile());
}

  return (
    <div>
      <h1> Import your {chatPlatform} chat file</h1>
      <button onClick={handleUploadClick} type="button">Upload</button>
      <ul>
        {chatNames.map((chatName) => (
          <li key={chatName}>{chatName}</li>
        ))}
      </ul>
      <h3> Help! How do I get my chat file?</h3>
    </div>
  );
}

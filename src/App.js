// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './Components/HomePage.js';
import ChoosePlatformPage from './Components/ChoosePlatformPage.js';
import UploadFilePage from './Components/UploadFilePage.js';
import SelectChatsPage from './Components/SelectChatsPage.js';
import IdentifyMePage from './Components/IdentifyMePage.js';
import MatchContactsPage from './Components/MatchContactsPage.js';
import ConfirmImportPage from './Components/ConfirmImportPage.js';
import StatusPage from './Components/StatusPage.js';
import ImportSuccessPage from './Components/ImportSuccessPage.js'
import ViewChatPage from './Components/ViewChatPage.js';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="import/choose-platform" element={<ChoosePlatformPage />} />
        <Route path="import/upload-file" element={<UploadFilePage />} />
        <Route
          path="import/processing"
          element={<StatusPage status="Processing Files..." />}
        />
        <Route path="import/select-chats" element={<SelectChatsPage />} />
        <Route path="import/identify-me" element={<IdentifyMePage />} />
        <Route path="import/match-contacts" element={<MatchContactsPage />} />
        <Route path="import/confirm-import" element={<ConfirmImportPage />} />
        <Route
          path="import/importing"
          element={<StatusPage status="Importing Chats" />}
        />
        <Route path="import/success" element={<ImportSuccessPage />} />
        <Route path="view-chat" element={<ViewChatPage />} />
      </Routes>
    </div>
  );
}

export default App;

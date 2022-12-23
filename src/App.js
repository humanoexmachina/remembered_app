import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import HomePage from './Components/HomePage.js';
import ChoosePlatformPage from './Components/Import/Pages/ChoosePlatformPage.js';
import UploadFilePage from './Components/Import/Pages/UploadFilePage.js';
import SelectChatsPage from './Components/Import/Pages/SelectChatsPage.js';
import IdentifyMePage from './Components/Import/Pages/IdentifyMePage.js';
import MatchContactsPage from './Components/Import/Pages/MatchContactsPage.js';
import ConfirmImportPage from './Components/Import/Pages/ConfirmImportPage.js';
import StatusPage from './Components/Import/Pages/StatusPage.js';
import ImportSuccessPage from './Components/Import/Pages/ImportSuccessPage.js';
import ViewChatPage from './Components/Import/Pages/ViewChatPage.js';

function App() {
  const [chatPlatform, setChatPlatform] = useState('unknown');
  function chooseChatPlatform(platform) {
    setChatPlatform(platform);
  }

  const [chatFilePath, setChatFilePath] = useState('');
  function chooseChatFile(filePath) {
    setChatFilePath(filePath);
  }

  const [identifiedMe, setMe] = useState(null);
  function identifyMe(username) {
    setMe(username);
  }

  const initialChatMap = {
    'me myself and I': false,
    'big party': false,
    'alice wang': false,
    husky: false,
  };

  const [chats, setChatSelection] = useState(initialChatMap);
  function selectChats(key) {
    let curVal = chats[key];
    setChatSelection((prevState) => ({
      ...prevState,
      [key]: !curVal,
    }));
  }

  const initialContactsMap = {
    Alice: {
      contact: null,
      chats: [
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
      ],
    },
    ChunYu: {
      contact: null,
      chats: [
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
        'hello world',
        'friends',
        'Toronto Pen Club',
        'party',
      ],
    },
    Husky: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    Squishy: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    'John-Doe': {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    Tom: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    Steve: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    'Mary-Jane-Anne': {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    Jane: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    Rainy: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    LilSnoLeopard: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
    SeaWeedKisses: {
      contact: null,
      chats: ['party', 'hello world', 'friends', 'Toronto Pen Club'],
    },
  };

  const [contactsMap, setContactsMap] = useState(initialContactsMap);
  function mapContact(key, value) {
    let chatsList = contactsMap[key].chats;
    setContactsMap((prevState) => ({
      ...prevState,
      [key]: { contact: value, chats: chatsList },
    }));

    console.log(contactsMap);
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="import/choose-platform"
          element={
            <ChoosePlatformPage
              chatPlatform={chatPlatform}
              chooseChatPlatform={chooseChatPlatform}
            />
          }
        />
        <Route
          path="import/upload-file"
          element={<UploadFilePage chatPlatform={chatPlatform} chatFilePath={chatFilePath} chooseChatFile={chooseChatFile} />}
        />
        <Route
          path="import/processing"
          element={<StatusPage status="Processing Files..." />}
        />
        <Route
          path="import/select-chats"
          element={<SelectChatsPage chats={chats} selectChats={selectChats} />}
        />
        <Route
          path="import/identify-me"
          element={
            <IdentifyMePage
              chatPlatform={chatPlatform}
              identifiedUser={identifiedMe}
              identifyMe={identifyMe}
            />
          }
        />
        <Route
          path="import/match-contacts"
          element={
            <MatchContactsPage
              contactsMap={contactsMap}
              mapContact={mapContact}
            />
          }
        />
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

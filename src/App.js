import { Routes, Route, Navigate } from 'react-router-dom';
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

  // let initialChatMap = new Map();

  // const [chatNames, setChatNames] = useState([]);
  // function getChatNames(chatNames) {
  //   console.log('Chat name to set are', chatNames);
  //   setChatNames(chatNames);
  //   // console.log('Chat Names: ', chatNames);
  //   // chatNames.forEach((chatName) => {
  //   //   initialChatMap.set(chatName, false);
  //   // });
  //   // console.log('initial Chat Map: ', initialChatMap);
  // }

  async function initializeChats(chatNames) {
    let initialChatMap = new Map();
    console.log('Chat names are', chatNames);
    chatNames.forEach((chatName) => {
      initialChatMap.set(chatName, false);
    });
    console.log('Initial Chat Map: ', initialChatMap);
    await setChatSelection(initialChatMap);
    console.log('Chats are:', chats);
  }

  const [finishProcessing, setFinishProcessing] = useState(false);
  function signalProcessingComplete(status) {
    setFinishProcessing(status);
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

  const [identifiedMe, setMe] = useState(null);
  function identifyMe(username) {
    setMe(username);
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

  function getNumChats() {
    return Object.keys(chats).length;
  }

  var numExistingContacts = 0;
  var numNewContacts = 0;

  function sumContacts() {
    numExistingContacts = 0;
    numNewContacts = 0;

    for (let key in contactsMap) {
      if (contactsMap[key].contact != null) {
        ++numExistingContacts;
      } else {
        ++numNewContacts;
      }
    }
  }

  function getNumExistingContacts() {
    sumContacts();
    return numExistingContacts;
  }

  function getNumNewContacts() {
    sumContacts();
    return numNewContacts;
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
          element={
            <UploadFilePage
              chatPlatform={chatPlatform}
              chatFilePath={chatFilePath}
              chooseChatFile={chooseChatFile}
              initializeChats={initializeChats}
              signalProcessingComplete={signalProcessingComplete}
            />
          }
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
              contactsMap={contactsMap}
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
        <Route
          path="import/confirm-import"
          element={
            <ConfirmImportPage
              getNumChats={getNumChats}
              getNumExistingContacts={getNumExistingContacts}
              getNumNewContacts={getNumNewContacts}
            />
          }
        />
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

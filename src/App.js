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

  const [processingStatus, setProcessingStatus] = useState('idle');
  function updateProcessingStatus(status) {
    setProcessingStatus(status);
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

  const initialParticipantsMap = {
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

  const [participantsMap, setparticipantsMap] = useState(
    initialParticipantsMap
  );
  function mapParticipant(key, value) {
    let chatsList = participantsMap[key].chats;
    setparticipantsMap((prevState) => ({
      ...prevState,
      [key]: { contact: value, chats: chatsList },
    }));
  }

  /* Existing Contacts and whether they have been matched */
  let queriedExistingContacts = {
    'Alice Wang': null,
    'Chunyu Shi': null,
    Mom: null,
    Dad: null,
    'Joe Schmoe': null,
    'Steve Smith': null,
    'Jane Doe': null,
    'Mary Jane': null,
    'Richard Wagner': null,
    'Ludvig Van Beethoven': null,
    'Amadeus Mozart': null,
  };

  const [existingContacts, setExistingContacts] = useState(
    queriedExistingContacts
  );

  function getUnMatchedContacts() {
    let unmatchedContacts = [];
    for (let contactName in existingContacts) {
      if (existingContacts[contactName] != null) {
        continue;
      }
      unmatchedContacts.push(contactName);
    }

    return unmatchedContacts;
  }

  function matchExistingContact(key, bool) {
    setExistingContacts((prevState) => ({
      ...prevState,
      [key]: bool,
    }));
  }

  // TODO: not totally sure where to set this. Has to be after import
  function resetDefaultExistingContacts() {
    setExistingContacts(queriedExistingContacts);
  }

  /* Final Confirm Import Page */
  function getNumChats() {
    return Object.keys(chats).length;
  }

  var numExistingContacts = 0;
  var numNewContacts = 0;

  function sumContacts() {
    numExistingContacts = 0;
    numNewContacts = 0;

    for (let key in participantsMap) {
      if (participantsMap[key].contact != null) {
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
              processingStatus={processingStatus}
              updateProcessingStatus={updateProcessingStatus}
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
              participantsMap={participantsMap}
              identifiedUser={identifiedMe}
              identifyMe={identifyMe}
            />
          }
        />
        <Route
          path="import/match-contacts"
          element={
            <MatchContactsPage
              participantsMap={participantsMap}
              mapParticipant={mapParticipant}
              getUnMatchedContacts={getUnMatchedContacts}
              existingContacts={existingContacts}
              matchExistingContact={matchExistingContact}
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

// import { useState } from 'react';
import {Link, Routes, Route} from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="import/choose-platform">Import Chats</Link>
    </div>
  )
}

const ChoosePlatformPage = () => {

  // const [chatPlatform, setChatPlatform] = useState("unknown");

  // const handleChoosePlatform = () => {
  //   setChatPlatform("messenger");
  //   console.log('Chose messenger as the chat platform!');
  // }

  return (
    <div>
      <h1>Import Chats from</h1>
      <Link to="../import/upload-file">Messenger</Link>
      <Link to="../import/upload-file">Instagram</Link>
    </div>
  )
}

// TODO: Add state to pass the chatPlatform information
const UploadFilePage = ({chatPlatform}) => {
  return (
    <div>
      <h1> Import your {chatPlatform} chat file</h1>
      <Link to="../import/processing">Select File to Import</Link>
      <h3> Help! How do I get my chat file?</h3>
    </div>
  )
}

const StatusPage = ({status}) => {
  // To hook up with backend code that processes files
  return (
    <div>
      <h1>{status}</h1>
    </div>
  )
}

const SelectChatsPage = () => {
  return (
    <div>
      <h1>Select Chats to Import</h1>
      <Link to="../import/identify-me">Next</Link>
    </div>
  )
}

const IdentifyMePage = ({chatPlatform}) => {
  return (
    <div>
      <h1>Which user is you on {chatPlatform}?</h1>
      <Link to="../import/match-contacts">Next</Link>
    </div>
  )
}

const MatchContactsPage = () => {
  return (
    <div>
      <h1>Match Participants to Contacts</h1>
      <Link to="../import/confirm-import">Skip Mapping/ Continue</Link>
    </div>
  )
}

const ConfirmImportPage = () => {
  return (
    <div>
      <h1>Confirm Import</h1>
      <Link to="../import/importing">Start Import</Link>
    </div>
  )
}

const ImportSuccessPage = () => {
  return (
    <div>
      <h1>Successfully imported chats</h1>
      <Link to="../view-chat">Finish</Link>
    </div>
  )
}

const ViewChatPage = () => {
  return (
    <div>
      <h1>View chat with mom :)</h1>
    </div>
  )
}

function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="import/choose-platform" element={<ChoosePlatformPage />} />
        <Route path="import/upload-file" element={<UploadFilePage />}/>
        <Route path="import/processing" element={<StatusPage status="Processing Files..."/>} />
        <Route path="import/select-chats" element={<SelectChatsPage />}/>
        <Route path="import/identify-me" element={<IdentifyMePage />}/>
        <Route path="import/match-contacts" element={<MatchContactsPage />}/>
        <Route path="import/confirm-import" element={<ConfirmImportPage />}/>
        <Route path="import/importing" element={<StatusPage status="Importing Chats"/>}/>
        <Route path="import/success" element={<ImportSuccessPage />}/>
        <Route path="view-chat" element={<ViewChatPage />}/>
      </Routes>
    </div>
  )
}

export default App;

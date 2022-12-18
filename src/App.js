import {Link, Routes, Route} from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      Home Page
      <Link to="import/choose-platform">Import</Link>
    </div>
  )
}

const ChoosePlatformPage = () => {
  return (
    <div>
      Import Chats from Messenger or Instagram?
    </div>
  )
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="import/choose-platform" element={<ChoosePlatformPage />} />
      </Routes>
    </div>
  )
}

export default App;

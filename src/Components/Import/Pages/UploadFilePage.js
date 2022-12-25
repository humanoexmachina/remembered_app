import ImportContainer from '../Components/ImportContainer.js';

export default function UploadFilePage({ chatPlatform, chatFilePath, chooseChatFile, initializeChats, signalProcessingComplete }) {

  const title = `Import your ${chatPlatform} Chat File`;
  async function handleSelectFile() {
    chooseChatFile(await window.fileAPI.chooseFile());
  }

  async function handleUploadClick() {
    // Spin up a loading logo
    let chatNames = await window.fileAPI.processFile();
    initializeChats(chatNames);
    console.log('Have initialized chat selection');
    signalProcessingComplete(true);
  }

  function MainContent() {
    return (
    <div>
      <button onClick={handleSelectFile} type="button">Select a Chat File to Import</button>

      <p>Do you want to import this chat file: {chatFilePath}? </p>
      <button onClick={handleUploadClick} type="button">Import</button>

      <h3> Help! How do I get my chat file?</h3>
    </div>
  )};

  return (
    <ImportContainer
      title={title}
      back="../import/choose-platform"
      next="../import/select-chats"
    >
      <MainContent/>
    </ImportContainer>
  );
}

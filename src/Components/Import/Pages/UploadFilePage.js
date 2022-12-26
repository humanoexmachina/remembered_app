import ImportContainer from '../Components/ImportContainer.js';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function UploadFilePage({
  chatPlatform,
  chatFilePath,
  chooseChatFile,
  initializeChats,
  processingStatus,
  updateProcessingStatus,
}) {
  const title = `Import your ${chatPlatform} Chat File`;
  async function handleSelectFile() {
    chooseChatFile(await window.fileAPI.chooseFile());
  }

  async function handleUploadClick() {
    updateProcessingStatus('progress');
    let chatNames = await window.fileAPI.processFile();
    initializeChats(chatNames);
    console.log('Have initialized chat selection');
    updateProcessingStatus('success');
  }

  function MainContent() {
    return (
      <div>
        <Button onClick={handleSelectFile} sx={{ m: 2 }}>
          Select a Chat File to Import
        </Button>
        <Box sx={{ height: 40 }}>
          <p>Do you want to import this chat file: {chatFilePath}? </p>
          {processingStatus === 'success' ? (
            <Typography>Success!</Typography>
          ) : (
            <Fade
              in={processingStatus === 'progress'}
              style={{
                transitionDelay:
                  processingStatus === 'progress' ? '800ms' : '0ms',
              }}
              unmountOnExit
            >
              <CircularProgress />
            </Fade>
          )}
        </Box>
        <Button onClick={handleUploadClick} sx={{ m: 2 }}>
          Import
        </Button>
        <h3> Help! How do I get my chat file?</h3>
      </div>
    );
  }

  return (
    <ImportContainer
      title={title}
      backPath="../import/choose-platform"
      backText="Back"
      nextPath="../import/select-chats"
      nextText="Next"
    >
      <MainContent />
    </ImportContainer>
  );
}

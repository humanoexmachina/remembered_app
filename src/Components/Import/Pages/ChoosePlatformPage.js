import ImportContainer from '../Components/ImportContainer.js';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function ChoosePlatformPage(props) {

  function handleChoosePlatform(platform) {
    props.chooseChatPlatform(platform);
  }

  function isChecked(platform) {
    return (platform === props.chatPlatform);
  }

  function ChatPlatformCards() {
    return (
      <FormControl>
      <FormLabel id="chat-platform-group">Chat Platform</FormLabel>
      <RadioGroup
        aria-labelledby="chat-platform-group"
        // defaultValue="Messenger"
        name="radio-buttons-group"
      >
        <FormControlLabel value="Messenger" control={<Radio checked={isChecked("Messenger")} onChange={() =>handleChoosePlatform("Messenger")} />} label="Messenger" />
        <FormControlLabel value="Instagram" control={<Radio checked={isChecked("Instagram")} onChange={() =>handleChoosePlatform("Instagram")} />} label="Instagram" />
      </RadioGroup>
    </FormControl>
  )};
 
  return (
    <ImportContainer
      title="Import Chats from"
      back="/"
      next="../import/upload-file"
    >
      <ChatPlatformCards/>
    </ImportContainer>
  );
}

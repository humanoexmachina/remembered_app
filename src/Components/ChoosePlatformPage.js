import { Link } from 'react-router-dom';

export default function ChoosePlatformPage(props) {

  function handleChoosePlatform(platform) {
    props.chooseChatPlatform(platform);

  }

  return (
    <div>
      <h1>Import Chats from</h1>
      <Link to="../import/upload-file" onClick={() => handleChoosePlatform("Messenger")}>Messenger</Link>
      <Link to="../import/upload-file" onClick={() => handleChoosePlatform("Instagram")}>Instagram</Link>
    </div>
  );
}

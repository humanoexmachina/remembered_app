import { Link } from 'react-router-dom';

export default function ChoosePlatformPage() {
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
  );
}

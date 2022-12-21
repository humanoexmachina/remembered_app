import { Link } from 'react-router-dom';

export default function ImportSuccessPage() {
  return (
    <div>
      <h1>Successfully imported chats</h1>
      <Link to="../view-chat">Finish</Link>
    </div>
  );
}

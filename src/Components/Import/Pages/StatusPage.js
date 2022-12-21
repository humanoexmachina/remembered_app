import { Link } from 'react-router-dom';

export default function StatusPage({ status }) {
  // To hook up with backend code that processes files
  return (
    <div>
      <h1>{status}</h1>
      <Link to="../import/select-chats">Next</Link>
    </div>
  );
}

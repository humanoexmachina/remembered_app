import { Link } from 'react-router-dom';

// TODO: Add state to pass the chatPlatform information
export default function UploadFilePage({ chatPlatform }) {
  return (
    <div>
      <h1> Import your {chatPlatform} chat file</h1>
      <Link to="../import/processing">Select File to Import</Link>
      <h3> Help! How do I get my chat file?</h3>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function IdentifyMePage({ chatPlatform }) {
  return (
    <div>
      <h1>Which user is you on {chatPlatform}?</h1>
      <Link to="../import/match-contacts">Next</Link>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function ImportBottomNav({ path }) {
  return (
    <div>
      <Link to={path}>Next</Link>
    </div>
  );
}

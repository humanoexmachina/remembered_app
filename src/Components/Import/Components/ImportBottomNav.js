import { Link } from 'react-router-dom';

import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function ImportBottomNav({
  backText,
  backPath,
  nextText,
  nextPath,
}) {
  return (
    <div className="block" style={{ paddingTop: '1rem' }}>
      <div className="level is-mobile">
        <div className="level-left">
          <div className="level-item">
            <Link to={backPath}>
              <i className="fas fa-chevron-left" /> {backText}
            </Link>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link to={nextPath}>
              {nextText} <i className="fas fa-chevron-right" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

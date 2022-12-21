import { Link } from 'react-router-dom';

import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function ImportBottomNav({ back, next }) {
  return (
    <div className="block">
      <div className="level is-mobile">
        <div className="level-left">
          <div className="level-item">
            <Link to={back}>
              <i className="fas fa-chevron-left" /> Back
            </Link>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link to={next}>
              Next <i className="fas fa-chevron-right" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

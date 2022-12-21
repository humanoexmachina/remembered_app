import 'bulma/css/bulma.min.css';

import ImportBottomNav from './ImportBottomNav.js';
import ImportHeader from './ImportHeader.js';

export default function ImportContainer({ children, title, back, next }) {
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-three-quarters">
          <ImportHeader>{title}</ImportHeader>

          {children}

          <ImportBottomNav back={back} next={next} />
        </div>
      </div>
    </div>
  );
}

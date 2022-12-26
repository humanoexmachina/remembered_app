import 'bulma/css/bulma.min.css';

import ImportBottomNav from './ImportBottomNav.js';
import ImportHeader from './ImportHeader.js';

export default function ImportContainer({
  children,
  title,
  backText,
  backPath,
  nextText,
  nextPath,
}) {
  return (
    <div className="container p-1">
      <div className="columns is-centered">
        <div className="column is-three-quarters">
          <ImportHeader>{title}</ImportHeader>
          {children}
          <ImportBottomNav
            backText={backText}
            backPath={backPath}
            nextText={nextText}
            nextPath={nextPath}
          />
        </div>
      </div>
    </div>
  );
}

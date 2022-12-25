import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportContainer from '../Components/ImportContainer.js';

export default function SelectChatsPage({ selectChats, chats }) {
  const handleClick = (key) => {
    selectChats(key);
  };

  const renderedObj = Object.keys(chats).map((key) => (
    <div className="columns is-vcentered" key={key}>
      <button className="button mr-3" onClick={() => handleClick(key)}>
        <span className="icon">
          <i className={chats[key] ? `fas fa-check` : ``}></i>
        </span>
      </button>
      <span style={{ fontWeight: chats[key] ? `bold` : `normal` }}>{key}</span>
      <hr style={{ borderTop: '1px dashed lightgray' }}></hr>
    </div>
  ));

  return (
    <ImportContainer
      title="Select Chats to Import"
      backText="Back"
      backPath="../import/upload-file"
      nextText="Next"
      nextPath="../import/identify-me"
    >
      {renderedObj}
    </ImportContainer>
  );
}

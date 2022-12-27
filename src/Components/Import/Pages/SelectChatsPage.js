import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportContainer from '../Components/ImportContainer.js';

export default function SelectChatsPage({ selectChats, chats, updateChatParticipantMap }) {
  const handleClick = (key) => {
    selectChats(key);
  };

  async function handleConfirmClick() {
    let chatParticipantMap = await window.fileAPI.ParticipantsToChats(chats);
    updateChatParticipantMap(chatParticipantMap);
  }

  const renderedObj = Object.keys(chats).map((key) => (
    <div className="columns is-vcentered" key={key}>
      <button className="button mr-3" onClick={() => handleClick(key)}>
        <span className="icon">
          <i className={chats[key] ? `fas fa-check` : ``}></i>
        </span>
      </button>
      <span style={{ fontWeight: chats[key] ? `bold` : `normal` }}>{key.split('_')[0]}</span>
      <hr style={{ borderTop: '1px dashed lightgray' }}></hr>

      <button className="button mr-3" onClick={handleConfirmClick}>Confirm</button>
      
    </div>
  ));

  return (
    <ImportContainer
      title="Select Chats to Import"
      back="../import/upload-file"
      next="../import/identify-me"
    >
      {renderedObj}
    </ImportContainer>
  );
}

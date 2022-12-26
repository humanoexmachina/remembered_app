import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportContainer from '../Components/ImportContainer.js';

export default function IdentifyMePage({
  chatPlatform,
  participantsMap,
  identifyMe,
  identifiedUser,
}) {
  const handleClick = (name) => {
    identifyMe(name);
  };

  const renderedObj = Object.keys(participantsMap).map((key) => (
    <button
      key={key}
      className={
        identifiedUser === key
          ? 'button is-primary mx-3 my-3'
          : 'button mx-3 my-3'
      }
      onClick={() => handleClick(key)}
    >
      {key}
    </button>
  ));

  return (
    <ImportContainer
      title={`Which user are you on ${chatPlatform}?`}
      backText="Back"
      backPath="../import/select-chats"
      nextText="Next"
      nextPath="../import/match-contacts"
    >
      <div className="columns">
        <div className="column is-multiline">{renderedObj}</div>
      </div>
    </ImportContainer>
  );
}

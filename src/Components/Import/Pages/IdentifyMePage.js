import { useState } from 'react';

import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportContainer from '../Components/ImportContainer.js';

const uniqueUsers = [
  'Alice',
  'ChunYu',
  'Husky',
  'Squishy',
  'John-Doe',
  'Tom',
  'Steve',
  'Mary-Jane-Anne',
  'Jane',
  'Rainy',
  'LilSnoLeopard',
  'SeaWeedKisses',
];

export default function IdentifyMePage({
  chatPlatform,
  identifyMe,
  identifiedUser,
}) {
  const handleClick = (name) => {
    identifyMe(name);
  };

  const renderedObj = uniqueUsers.map((username, index) => (
    <button
      key={index}
      className={
        identifiedUser === username
          ? 'button is-primary mx-3 my-3'
          : 'button mx-3 my-3'
      }
      onClick={() => handleClick(username)}
    >
      {username}
    </button>
  ));

  return (
    <ImportContainer
      title={`Which user are you on ${chatPlatform}?`}
      back="../import/select-chats"
      next="../import/match-contacts"
    >
      <div className="columns">
        <div className="column is-multiline">{renderedObj}</div>
      </div>
    </ImportContainer>
  );
}

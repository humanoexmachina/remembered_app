import { Link } from 'react-router-dom';

import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportBottomNav from './ImportBottomNav.js';

const chatsMap = {
  'me myself and I': {
    participants: 3,
    top_participants: ['Rainy', 'husky', 'kitty', 'squishy', 'Alice'],
    last_message:
      'Had a great time at the event yesterday!! Qui dolore laborum adipisicing non commodo sunt nostrud consectetur incididunt consectetur minim ex reprehenderit. Qui laboris dolor aliquip duis cupidatat deserunt. Nulla amet quis fugiat nisi irure nostrud nulla id minim amet. Minim Lorem sunt et ut anim nisi mollit. Mollit elit id adipisicing in dolore exercitation amet labore voluptate quis aute. Irure do occaecat elit deserunt.',
    sender: 'Rainy',
    sent_date: 1671568952,
  },
  'hello kitty': {
    participants: 3,
    top_participants: ['Rainy', 'husky', 'kitty', 'squishy', 'Alice'],
    last_message: 'Had a great time at the event yesterday!!',
    sender: 'Rainy',
    sent_date: 1671568952,
  },
  'alice wang': {
    participants: 3,
    top_participants: ['Rainy', 'husky', 'kitty', 'squishy', 'Alice'],
    last_message:
      'Occaecat culpa exercitation do ullamco mollit anim quis reprehenderit magna adipisicing ullamco nulla aliqua nisi.',
    sender: 'Rainy',
    sent_date: 1671568952,
  },
  husky: {
    participants: 3,
    top_participants: ['Rainy', 'husky', 'kitty', 'squishy', 'Alice'],
    last_message: 'Had a great time at the event yesterday!!',
    sender: 'Rainy',
    sent_date: 1671568952,
  },
};
const chats = ['me myself and I', 'hello kitty', 'alice wang', 'husky'];

export default function SelectChatsPage() {
  const renderedObj = Object.entries(chatsMap).map(([name, prop]) => (
    <div className="block">
      <article class="media">
        <figure class="media-left">
          <button class="button is-large">
            <span class="icon is-small">
              <i class="fas fa-check"></i>
            </span>
          </button>
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{name}</strong>{' '}
              <small>{prop.participants} participants:</small>{' '}
              <small>member names here...</small>
              <br />
              {prop.sender}:{' '}
              {prop.last_message.length > 300
                ? prop.last_message.substring(0, 300) + '...'
                : prop.last_message}{' '}
              <br />
              <small>{Date(prop.sent_date)}</small>
            </p>
          </div>
        </div>
      </article>
    </div>
  ));

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-three-quarters">
          <div className="block">
            <h1 className="title">Select Chats to Import</h1>
          </div>
          {renderedObj}

          <div className="block">
            <ImportBottomNav path="../import/identify-me" />
          </div>
        </div>
      </div>
    </div>
  );
}

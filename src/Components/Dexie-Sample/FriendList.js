import { useLiveQuery } from 'dexie-react-hooks';

import { db } from './db.js';

export default function FriendList() {
  const friends = useLiveQuery(() => db.friends.toArray());

  return (
    <ul>
      {friends?.map((friend) => (
        <li key={friend.id}>
          {friend.name}, {friend.age}
        </li>
      ))}
    </ul>
  );
}

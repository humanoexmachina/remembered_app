import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ImportContainer from '../Components/ImportContainer.js';
import ImportContactModal from '../Components/ImportContactModal.js';
import { useState } from 'react';

export default function MatchContactsPage({ contactsMap, mapContact }) {
  let [selectedContact, setContact] = useState(null);

  function selectContact(name) {
    setContact(name);
  }

  const [modal, setModal] = useState(false);

  function toggleModal() {
    setModal(!modal);
  }

  const handleClick = (key, value) => {
    selectContact(key);
    toggleModal();
  };

  const value = 'temp';

  const maxChatLength = 280;

  const renderedObj = Object.keys(contactsMap).map((key) => (
    <div className="box" key={key} onClick={() => handleClick(key, value)}>
      <div className="columns is-mobile is-vcentered">
        <div className="column">
          <div className="columns is-vcentered">
            <div className="column is-narrow">
              <button
                className={
                  contactsMap[key].contact === null
                    ? 'button is-large'
                    : 'button is-large is-success'
                }
              >
                <span className="icon">
                  <i
                    className={
                      contactsMap[key].contact === null
                        ? 'fas fa-question'
                        : 'fas fa-check'
                    }
                  ></i>
                </span>
              </button>
            </div>
            <div className="column">
              <strong>{key} &nbsp;</strong>
              <br />
              <small>
                {contactsMap[key].chats.join(', ').length > maxChatLength
                  ? contactsMap[key].chats
                      .join(', ')
                      .substring(0, maxChatLength) + '...'
                  : contactsMap[key].chats.join(', ')}
              </small>
            </div>
          </div>
        </div>

        <div
          className={
            contactsMap[key].contact === null
              ? 'is-hidden'
              : 'column is-one-third'
          }
        >
          <div className="columns is-vcentered">
            <div className="column is-narrow">
              <figure className="image is-64x64">
                <img
                  className="is-rounded"
                  src="https://bulma.io/images/placeholders/480x480.png"
                  alt="Placeholder"
                />
              </figure>
            </div>
            <div className="column">
              <p className="title is-5">{contactsMap[key].contact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <ImportContainer
      title="Match Your Contacts"
      backText="Back"
      backPath="../import/identify-me"
      nextText="Next"
      nextPath="../import/confirm-import"
    >
      <>
        {renderedObj}

        {/* Modal */}
        {modal && (
          <ImportContactModal
            modal={modal}
            toggleModal={toggleModal}
            name={selectedContact}
            mapContact={mapContact}
          />
        )}
      </>
    </ImportContainer>
  );
}

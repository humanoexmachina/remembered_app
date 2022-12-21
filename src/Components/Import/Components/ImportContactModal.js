import ReactModal from 'react-modal';
import { useState } from 'react';

import ImportContactSearch from './ImportContactSearch.js';

export default function ImportContactModal({
  modal,
  toggleModal,
  name,
  mapContact,
}) {
  ReactModal.setAppElement('#root');

  // const [selectedContact, setContact] = useState(null);

  // function chooseContact(value) {
  //   setContact(value);
  // }

  return (
    <ReactModal
      isOpen={modal}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      preventScroll /* this is not working */
      onRequestClose={toggleModal}
      style={{
        overlay: {
          backgroundColor: 'rgba(49, 49, 49, 0.8)',
        },
        content: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '600px',
          minWidth: '300px',
          minHeight: '500px',
          border: '0px solid #ccc',
          background: '#fff',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '10px',
          outline: 'none',
          padding: '20px',
        },
      }}
    >
      <div className="columns is-mobile">
        <div className="column">
          <h1 className="title">Match Contact {name}</h1>
          {/* matched to {selectedContact} */}
        </div>
        <div className="column is-narrow">
          <button
            className="button"
            style={{ border: 0 }}
            onClick={toggleModal}
          >
            <span className="icon">
              <i className="fas fa-times"></i>
            </span>
          </button>
        </div>
      </div>
      <ImportContactSearch
        mapContact={mapContact}
        name={name}
        toggleModal={toggleModal}
      />
    </ReactModal>
  );
}

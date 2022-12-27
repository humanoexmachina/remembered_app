import ReactModal from 'react-modal';
import { useEffect, useRef, useState } from 'react';

import Button from '@mui/joy/Button';

import ImportContactSearch from './ImportContactSearch.js';

export default function ImportContactModal({
  modal,
  toggleModal,
  participantName,
  participantsMap,
  existingContacts,
  getUnMatchedContacts,
  mapParticipant,
  matchExistingContact,
}) {
  ReactModal.setAppElement('#root');

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
          minWidth: '450px',
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
          <h1 className="title">Match Contact {participantName}</h1>
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
        participantName={participantName}
        toggleModal={toggleModal}
        participantsMap={participantsMap}
        existingContacts={existingContacts}
        getUnMatchedContacts={getUnMatchedContacts}
        mapParticipant={mapParticipant}
        matchExistingContact={matchExistingContact}
      />
    </ReactModal>
  );
}

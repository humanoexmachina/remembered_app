import Autocomplete from '@mui/joy/Autocomplete/index.js';
// import Input from '@mui/joy/Input';

// https://mui.com/joy-ui/react-autocomplete/

export default function ImportContactSearch({
  participantName,
  toggleModal,
  participantsMap,
  existingContacts,
  getUnMatchedContacts,
  mapParticipant,
  matchExistingContact,
}) {
  return (
    <Autocomplete
      options={getUnMatchedContacts()}
      onChange={(event, selectedDropdownContact) => {
        let prevSelectedContact = participantsMap[participantName];
        console.log('participantName:', participantName);
        console.log(
          'prevSelectedContact.contact:',
          prevSelectedContact.contact
        );
        console.log('selectedDropdownContact:', selectedDropdownContact);
        if (prevSelectedContact.contact != null) {
          console.log('this participant is already matched, clearing!');
          matchExistingContact(prevSelectedContact.contact, null);
          console.log(existingContacts);
        }
        matchExistingContact(selectedDropdownContact, participantName);
        mapParticipant(participantName, selectedDropdownContact);
        // console.log(existingContacts);
        toggleModal();
      }}
    />
  );
}

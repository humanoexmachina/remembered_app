import Autocomplete from '@mui/joy/Autocomplete/index.js';
// import Input from '@mui/joy/Input';

// https://mui.com/joy-ui/react-autocomplete/

export default function ImportContactSearch({
  name,
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
      onChange={(event, selectedContact) => {
        console.log(selectedContact);
        mapParticipant(name, selectedContact);
        if (participantsMap[selectedContact] != null) {
          matchExistingContact(selectedContact, null);
          console.log(existingContacts);
        }
        matchExistingContact(selectedContact, name);
        console.log(existingContacts);
        toggleModal();
      }}
    />
  );
}

import Autocomplete from '@mui/joy/Autocomplete/index.js';
// import Input from '@mui/joy/Input';

// https://mui.com/joy-ui/react-autocomplete/

export default function ImportContactSearch({ toggleModal, mapContact, name }) {
  const unMatchedContacts = [
    'Alice Wang',
    'Chunyu Shi',
    'Mom',
    'Dad',
    'Joe Schmoe',
    'Steve Smith',
    'Jane Doe',
    'Mary Jane',
    'Richard Wagner',
    'Ludvig Van Beethoven',
    'Amadeus Mozart',
  ];
  return (
    <Autocomplete
      options={unMatchedContacts}
      onChange={(event, newValue) => {
        console.log(newValue);
        mapContact(name, newValue);
        toggleModal();
      }}
    />
  );
}

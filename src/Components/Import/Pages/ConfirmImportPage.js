import ImportContainer from '../Components/ImportContainer.js';

export default function ConfirmImportPage({
  getNumChats,
  getNumExistingContacts,
  getNumNewContacts,
}) {
  return (
    <ImportContainer
      title="Confirm Import"
      backText="Back"
      backPath="../import/match-contacts"
      nextText="Start Import"
      nextPath="../import/importing"
    >
      <p>{getNumChats()} chats will be imported</p>
      <p>{getNumExistingContacts()} contacts will be mapped to existing ones</p>
      <p>{getNumNewContacts()} new contacts will be created</p>
    </ImportContainer>
  );
}

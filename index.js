import * as fs from 'node:fs';
import * as path from 'node:path';
import AdmZip, * as admZip from 'adm-zip';
import getFolderSize from 'get-folder-size';
import {isNotJunk} from 'junk';


const chatMemoryDir = `/Users/alicewang913/Documents/Remembered/ChatMemory`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/WhatsApp_Chat_Chunyu_Shi`;
let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_ins_JSON`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_20221123.zip`;

const ChatSource = {
  Unknown: Symbol("unknown"),
  WhatsApp: Symbol("whatsapp"),
  Meta: Symbol("meta")
}

const JSON = `.json`;

let chatSource = ChatSource.Unknown;

// check if the chat history is a zip file or folder
const chatHistoryStats = fs.statSync(chatHistoryPath);

if (chatHistoryStats.isFile() && (path.extname(chatHistoryPath) == `.zip`)) {
  // users uploaded a zip file
  console.log(`Users uploaded a zip file`);

  // create directory
  if (!fs.existsSync()) fs.mkdirSync(chatMemoryDir, {recursive: true});
  console.log(`created ${chatMemoryDir}`);
  // unzip the file
  const chatZip = new AdmZip(chatHistoryPath);
  chatZip.extractAllTo(chatMemoryDir);

  // update the path to the new decompressed folder
  chatHistoryPath = chatMemoryDir;
} else if (chatHistoryStats.isDirectory()) {
  // users uploaded a chat history directory
  console.log(`Users uploaded a chat history directory`);
} else {
  throw new Error(`Please upload the original chat history file downloaded from chat apps`);
}


// Determine the source of the chat history
if (fs.existsSync(path.join(chatHistoryPath, `_chat.txt`))) {
  // chat history is from whatsapp
  console.log("Chat history is from Whatsapp")
  chatSource = ChatSource.WhatsApp;
} else if (fs.existsSync(path.join(chatHistoryPath, `messages`))) {
  // chat history is from Meta
  console.log("Chat history is from Meta");
  chatSource = ChatSource.Meta;
} else {
  throw new Error("Seems like there is no chat history to be read");
}

switch (chatSource) {
  case ChatSource.WhatsApp:
    if (fs.existsSync(path.join(chatHistoryPath, `_chat.txt`))) {
      console.log(`Parsing the chat file from WhatsApp`);
    }
    console.log(`Save multi-media files to the memory folder on disk`);
  break;
  case ChatSource.Meta:
    const inboxDir = path.join(chatHistoryPath, `messages/inbox`);
    if (fs.existsSync(inboxDir)) {
      // sort chats by the size to gauga the importance of contacts
      const contactsWithSize = new Map();
      const contacts = await fs.readdirSync(inboxDir).filter(isNotJunk);
      for (const contact of contacts) {
        contactsWithSize.set(contact, await getFolderSize.loose(path.join(inboxDir, contact)));
      }
      const sortedContacts = new Map([...contactsWithSize.entries()].sort((a, b) => b[1] - a[1]));
      console.log(sortedContacts);

      // Parse chats with all contacts for now; only parse selected chats later based on user selection
      const selectedContacts = sortedContacts;
      
      for (let chatContact of selectedContacts.keys()) {
        // parse each json in the chat folder
        let chatFiles = fs.readdirSync(path.join(inboxDir, chatContact)).filter(file => {
          return path.extname(file) == JSON;
        });
        
        for (let chatFile of chatFiles) {
          console.log(`Parsing ${path.join(inboxDir, chatContact, chatFile)}`);
          console.log(`Saving all multi-media files to disk`);
        }
      }
    } else {
      console.error(`No chats to read`);
    }
  break;
  case ChatSource.Unknown:
    console.log(`Chat source unknown. Nothing to parse`);
  break;
}
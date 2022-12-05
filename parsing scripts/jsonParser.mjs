'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import sqlite3 from 'sqlite3';
import { join } from 'node:path';

/* enums: https://www.sohamkamani.com/javascript/enums/ */
class Platform {
    // Create new instances of the same class as static attributes
    static Messenger = new Platform(1)
    static Instagram = new Platform(2)

    constructor(name) {
        this.name = name
    }
}

class ChatStatus {
    // Create new instances of the same class as static attributes
    static Live = new ChatStatus(1)
    static Archived = new ChatStatus(2)

    constructor(name) {
        this.name = name
    }
}

/* Open Database */
let db = new sqlite3.Database('../data/remembered.db', (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.log('Successfully connected to remembered.db SQLite3 database.');
});

initializeDatabaseTables()
loadFile('../files/messenger/jiannanwang_-mmv48t8bq/message_1.json', Platform.Messenger.name, "jiannanwang_-mmv48t8bq", "jiannanwang");

async function loadFile(filePath, platform, platformContactId, chatTitle) {
    let rawData = await fs.promises.readFile(filePath);
    let parsedFile = JSON.parse(rawData);
    let participants = parsedFile.participants;
    let messages = parsedFile.messages;
    var finalChatParticipants = []

    getParticipants(participants, platform, platformContactId, function(participants) {
        console.log('participants:', participants)
        finalChatParticipants = participants;
        console.log('finalChatParticipants inside:', finalChatParticipants)
    });

    console.log(`finalChatParticipants: ${finalChatParticipants}`)
    getMessages(messages);
};

function getParticipants(participants, platform, platformContactId, callback) {
    var allParticipants = []

    const contactCallback = function(error, id) {
        if (error) {
            console.log(err);
            throw err;
        }

        console.log(`id just added: ${id}`)
        allParticipants.push(id)
        console.log('allParticipants:', allParticipants)
    }

    for (let i = 0; i < participants.length; i++) {
        const name = participants[i].name;

        if (i < participants.length - 1) {
            switch (platform) {
                case Platform.Messenger.name:
                    insertNewContact(name, platformContactId, null, contactCallback);
                    break;
                case Platform.Instagram.name:
                    insertNewContact(name, null, platformContactId, contactCallback);
                    break;
            }
        }
    }

    console.log("allParticipants outside:", allParticipants)
    callback(allParticipants)
};

function getMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const type = message.type;

        switch (type) {
            case 'Generic':
                const text = message.content;
                const audioFiles = message.audio_files;
                const videoFiles = message.videos;
                const photoFiles = message.photos;

                if (text != null) {
                    const decodedText = utf8.decode(text); // decodes symbols and emojis
                    // console.log(decodedText);
                } else {
                    if (audioFiles != null) {
                        // console.log(audioFiles[0].uri);
                    } else if (videoFiles != null) {
                        // console.log(videoFiles[0].uri);
                    } else if (photoFiles != null) {
                        // console.log(photoFiles[0].uri);
                    } else {
                        // console.log('no matching format');
                    }
                }
                break;
            case 'Share':
                console.log(message.share.link);
                break;
        }
    }
};

function initializeDatabaseTables() {
    db.serialize(() => {
        // 1rst operation (run create table statement)
        db.run(`CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY, 
                title TEXT NOT NULL, 
                participants INT NOT NULL,
                platforms INT NOT NULL,
                status INT NOT NULL
            )`, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY, 
                name TEXT NOT NULL,
                messenger_ids TEXT,
                instagram_ids TEXT
            )`, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
}

// db.serialize let us run sqlite operations in serial order
// db.serialize(() => {

// });

function insertNewContact(contactName, messengerId, instagramId, callback) {
    const query = 'INSERT INTO contacts(name,messenger_ids,instagram_ids) VALUES(?,?,?)'
    const values = [contactName, messengerId, instagramId]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    });
}

function insertNewChat(chatTitle, participants, platform, callback) {
    const query = 'INSERT INTO chats(title,participants,platforms,status) VALUES(?,?,?,?)'
    const values = [chatTitle, participants, platform, 1]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    });
}

// 3rd operation (retrieve data from users table)
// db.each(`SELECT email FROM users`, (err, row) => {
//     if (err) {
//         console.log(err);
//         throw err;
//     }
//     console.log(row.email);
// }, () => {
//     console.log('query completed')
// });
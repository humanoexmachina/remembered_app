'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import sqlite3 from 'sqlite3';

async function loadFile(filePath) {
    let rawData = await fs.promises.readFile(filePath);
    let parsedFile = JSON.parse(rawData);
    let participants = parsedFile.participants;
    let messages = parsedFile.messages;

    getParticipants(participants);
    getMessages(messages);
};

function getParticipants(participants) {
    for (let i = 0; i < participants.length; i++) {
        const name = participants[i].name;
        console.log(name);
    }
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
                    console.log(decodedText);
                } else {
                    if (audioFiles != null) {
                        console.log(audioFiles[0].uri);
                    } else if (videoFiles != null) {
                        console.log(videoFiles[0].uri);
                    } else if (photoFiles != null) {
                        console.log(photoFiles[0].uri);
                    } else {
                        console.log('no matching format');
                    }
                }
                break;
            case 'Share':
                console.log(message.share.link);
                break;
        }
    }
};

/* EXAMPLE */
loadFile('../files/messenger/jiannanwang_-mmv48t8bq/message_1.json');

/* Database */
let db = new sqlite3.Database('../data/remembered.db', (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.log('Successfully connected to remembered.db SQLite3 database.');
});

db.run('
        CREATE TABLE chats(
            chat_id int primary
        )
        ')

        db.run('SELECT * FROM chats')

        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Successfully closed the database connection')
        })
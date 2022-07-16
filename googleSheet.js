const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { GoogleAuth } = require("google-auth-library");

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

// Create a service account initialize with the service account key file and scope needed
const auth = new GoogleAuth({
    keyFile: "credentials.json",
    scopes: SCOPES
});

const driveService = google.drive({ version: 'v3', auth });


module.exports.create = async () => {

    let fileMetadata = {
        'name': 'data',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        'parents': [{ id: '1fedWw56qxNUFhPO7Gk9oor_mpX0gBuRa' }]
    };

    let media = {
        mimeType: 'text/csv',
        body: fs.createReadStream('data.csv')
    };

    try {
        let response = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        console.log(response.data.id);
        return response.data.id
    } catch (error) {
        console.log(error);
    }
}

module.exports.generatePublicURL = async (fileId) => {
    console.log("permission:", fileId);
    try {
        await driveService.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "writer",
                type: 'anyone',
            },
        });

        const result = await driveService.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });
        console.log(result.data);
        return result.data
    } catch (error) {
        console.log(error);
    }
}


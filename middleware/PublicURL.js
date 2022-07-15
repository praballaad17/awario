const { google } = require('googleapis');

const CLIENT_ID = '1030940090591-p0m57ls5e51asnvmqtjqpi0o4fssalte.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//045AWdHiWVfOlCgYIARAAGAQSNwF-L9Ir4Icc7gbBrzoA8YliN2sLPfvchazAxKJk1CLJm13u5zh_nddSzOjIbvrcBnExfFcMgtg';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

async function generatePublicURL(fileId) {
    console.log("permission:", fileId);
    try {
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });
        console.log(result.data);
    } catch (error) {
        console.log(error);
    }
}


module.exports = generatePublicURL;
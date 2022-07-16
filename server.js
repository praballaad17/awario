const express = require("express")
const pdfparse = require('pdf-parse')
const upload = require('express-fileupload')
const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library");
const readPdfFile = require("./middleware/ReadPdf");
const { create, generatePublicURL } = require("./googleSheet");

const app = express()
app.set('view engine', 'pug')
require('dotenv').config()
app.use(upload())

app.get('/', async (req, res) => {
    res.render('index')
})
// require('./twitter')
app.post('/upload', (req, res) => {
    if (req.files) {

        const file = req.files.pdf

        pdfparse(file).then(async (data) => {
            const values = await readPdfFile(data.text, data.numpages)
            const auth = new GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            })

            const client = await auth.getClient()

            const service = google.sheets({ version: "v4", auth: client })
            let spreadsheetId = await create()


            const url = await generatePublicURL(spreadsheetId)
            console.log(url);
            //get shpreedsheet
            const metaData = await service.spreadsheets.get({
                auth,
                spreadsheetId
            })

            // write rows to spreadsheet
            await service.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "data!A:F",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [["Twitter Name", "Description", "Username", "link", "Audience", "Mentions"]]
                }
            })
            await service.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "data!A:E",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: values
                }
            })

            //  res.json({ data, metaData })
            return res.render('sheet', {
                url
            })
        })

    }
})

const port = process.env.PORT

app.listen(port, () => {
    console.log(`listening in port ${port}`);
})



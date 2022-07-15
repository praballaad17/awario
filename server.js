const express = require("express")
const pdfparse = require('pdf-parse')
const upload = require('express-fileupload')
const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library");
const generatePublicURL = require("./middleware/PublicURL");
const readPdfFile = require("./middleware/ReadPdf");


const app = express()
app.set('view engine', 'pug')
require('dotenv').config()
app.use(upload())

app.get('/', async (req, res) => {
    res.render('index')
})


app.post('/upload', (req, res) => {
    if (req.files) {

        const file = req.files.pdf

        pdfparse(file).then(async (data) => {
            const values = readPdfFile(data.text, data.numpages)
            const auth = new GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            })

            const client = await auth.getClient()

            const service = google.sheets({ version: "v4", auth: client })
            let spreadsheetId = '16fsS56K-q1wYoC2vHMlfhHDAC8nvpDWpCGi2iAYT3PA'
            let spreadsheet
            // //create a google sheet
            // const resource = {
            //     properties: {
            //         title: "title",
            //     },
            // }
            // try {
            //     spreadsheet = await service.spreadsheets.create({
            //         auth,
            //         resource,
            //         fields: 'spreadsheetId',
            //     });
            //     console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
            //     spreadsheetId = spreadsheet.data.spreadsheetId
            // } catch (err) {
            //     // TODO (developer) - Handle exception
            //     console.log(err);
            // }




            // write rows to spreadsheet
            await service.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "Sheet1!A:E",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [["Twitter Name", "Username", "link", "Audience", "Mentions"]]
                }
            })
            await service.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "Sheet1!A:E",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: values
                }
            })

            return res.json(data)
        })

    }
})
const port = process.env.PORT

app.listen(port, () => {
    console.log(`listening in port ${port}`);
})



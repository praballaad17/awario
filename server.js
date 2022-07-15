const express = require("express")
const bodyParser = require('body-parser');
const fs = require("fs");
const pdfparse = require('pdf-parse')
const upload = require('express-fileupload')
const { google } = require("googleapis")
const { GoogleAuth } = require("google-auth-library");
const generatePublicURL = require("./middleware/PublicURL");
const pdf_table_extractor = require("pdf-table-extractor");


const app = express()
app.set('view engine', 'pug')
require('dotenv').config()
app.use(upload())

// app.use(express.json({ limit: '50mb' }))
// app.use(bodyParser.urlencoded({ extended: false }));
// require('./googleSheet')
// const pdffile = fs.readFileSync('Report.pdf')

// pdfparse(pdffile).then((data) => {
//     console.log(data.text);
// })

app.get('/', async (req, res) => {
    res.render('index')




    // //get metadata about spreadsheet
    // const metaData = await service.spreadsheets.get({
    //     auth,
    //     spreadsheetId,

    // })



    // res.send(metaData)
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

const readPdfFile = (text, numpages) => {

    let pageValues = []
    console.log(numpages);
    for (let i = 0; i < numpages; i++) {
        let page
        if (text.indexOf(`Influencers Report${i + 3}`) === -1) {
            page = text.substring(
                text.indexOf(`Influencers Report${i + 2}`),
                text.length
            );

        }
        else {
            page = text.substring(
                text.indexOf(`Influencers Report${i + 2}`),
                text.indexOf(`Influencers Report${i + 3}`)
            );
        }

        const values = pageToArray(page)
        pageValues = pageValues.concat(values)
    }


    return pageValues
}

let num = '1234567890'

const pageToArray = (page) => {
    let values = [];

    let start = page.substring(
        page.indexOf("AudienceMentionsSentiment") + ("AudienceMentionsSentiment ").length,
        page.length
    );


    let k = 0, count = 0
    while (num.includes(start[k])) {

        values.push([start[k]])
        k += 2
        count++
        if (!num.includes(start[k]))
            break;
    }

    start = start.substring(
        k,
        start.length
    );

    for (let i = 0; i < count; i++) {

        const name = start.substring(0, start.indexOf("\n"));
        start = start.substring(
            start.indexOf("\n") + 1,
            start.length
        );
        const username = start.substring(1, start.indexOf("\n"));
        start = start.substring(
            start.indexOf("\n") + 1,
            start.length
        );
        const audience = start.substring(0, start.indexOf("\n"));
        start = start.substring(
            start.indexOf("\n") + 1,
            start.length
        );
        const link = `https://twitter.com/${username}`

        values[i] = [name, username, link, audience, ...values[i]]
    }


    return values;
}

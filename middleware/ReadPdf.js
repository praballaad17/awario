

const readPdfFile = (text, numpages) => {

    let pageValues = []

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

module.exports = pageToArray;
module.exports = readPdfFile;
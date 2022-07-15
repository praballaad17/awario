const axios = require('axios')


const getUser = async (username) => {
    const token = process.env.TWITTERBEARER
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const user = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}?user.fields=description`,
            // bodyParameters,
            config
        )
        if (user && user.data.data && user.data.data.description)
            return user.data.data.description
        else
            return ""

    } catch (error) {
        console.log(error);
    }

}

module.exports = getUser;
const axios = require('axios');

const searchJobs = async (query = 'developer', page = 1, num_pages = 1) => {
    const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: {
            query: query,
            page: page.toString(),
            num_pages: num_pages.toString()
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
        }
    };

    try {
        console.log(`Searching jobs for: ${query}, page: ${page}`);
        const response = await axios.request(options);
        console.log('RapidAPI Response Status:', response.status);
        // console.log('RapidAPI Response Data:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('RapidAPI Job Search Error:', error.message);
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Error Status:', error.response.status);
        }
        throw error;
    }
};

module.exports = { searchJobs };

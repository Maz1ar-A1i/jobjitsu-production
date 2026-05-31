import client from '../httpClient';

export const fetchJobs = async (query = 'developer', page = 1) => {
    try {
        const response = await client.get('/jobs/search', {
            params: { query, page }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

const jobService = require('../services/jobService');

const getJobs = async (req, res) => {
    try {
        const { query, page } = req.query;
        const data = await jobService.searchJobs(query || 'developer', page || 1);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

module.exports = { getJobs };

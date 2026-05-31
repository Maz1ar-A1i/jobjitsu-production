import client from '../httpClient';

export const fetchDashboardStats = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await client.get('/dashboard/stats', {
            params: userId ? { user_id: userId } : {},
            headers
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

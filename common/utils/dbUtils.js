const { getPool } = require('../config/database');

/**
 * Executes a database query using the connection pool
 * @param {string} query - The SQL query to execute
 * @param {Object} params - Optional parameters for the query
 * @returns {Promise} - The query result
 */
const executeQuery = async (query, params = {}) => {
    try {
        const pool = getPool();
        const request = pool.request();
        
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        return await request.query(query);
    } catch (error) {
        throw new Error(`Database query error: ${error.message}`);
    }
};

module.exports = {
    executeQuery
}; 
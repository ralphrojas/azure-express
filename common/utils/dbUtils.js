const { getPool } = require('../config/database');

/**
 * Executes a database query using the connection pool
 * @param {string} query - The SQL query to execute
 * @param {Object} params - Optional parameters for the query
 * @param {Object} transaction - Optional transaction object
 * @returns {Promise} - The query result
 */
const executeQuery = async (query, params = {}, transaction = null) => {
    try {
        const pool = getPool();
        const request = transaction ? transaction.request() : pool.request();
        
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        return await request.query(query);
    } catch (error) {
        throw new Error(`Database query error: ${error.message}`);
    }
};

/**
 * Executes a function within a transaction
 * @param {Function} callback - Function to execute within transaction
 * @returns {Promise} - Result of the callback function
 */
const executeTransaction = async (callback) => {
    const pool = getPool();
    const transaction = pool.transaction();
    
    try {
        await transaction.begin();
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    executeQuery,
    executeTransaction
}; 
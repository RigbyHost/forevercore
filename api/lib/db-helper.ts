import threadConnection from '../../serverconf/db';

// Temporary helper to get database connection with default GDPS ID
// TODO: This should be refactored to get gdpsid from request context
export async function getDefaultDb() {
    return await threadConnection('main');
}
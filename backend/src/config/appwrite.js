const { Client, Databases, Users, ID, Query, Account } = require('node-appwrite');
require('dotenv').config();

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'hustlershop-db';

if (!endpoint || !projectId || !apiKey) {
    console.error('Missing Appwrite credentials in .env file');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

// Client without API key for account operations (session-based)
const publicClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

const databases = new Databases(client);
const users = new Users(client);
const account = new Account(publicClient);

module.exports = {
    client,
    publicClient,
    databases,
    users,
    account,
    ID,
    Query,
    databaseId
};

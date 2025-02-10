import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();
const endpoint = process.env._APPWRITE_ENDPOINT
const pid = process.env._APPWRITE_PROJECT_ID
client
    .setEndpoint(endpoint)
    .setProject(pid);

export const id = ID
export const databases = new Databases(client)
export const account = new Account(client);
export { ID } from 'appwrite';

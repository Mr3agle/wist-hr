import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://portal.wist-ec.com/v1')
    .setProject('67a61236002c7ca82866');

export const id = ID
export const databases = new Databases(client)
export const account = new Account(client);
export { ID } from 'appwrite';

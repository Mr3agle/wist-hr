import { Client, Account, Databases, ID } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('http://localhost/v1')
    .setProject('67a23284001d926f3ce3'); // Replace with your project ID

export const id = ID
export const databases = new Databases(client)
export const account = new Account(client);
export { ID } from 'appwrite';

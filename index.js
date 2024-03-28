import express from 'express';
import path from 'path';
const app = express();
import bodyParser from 'body-parser';

import utils from './utils/index.js';
// Body parser middleware
app.use(bodyParser.json());
// Define route to handle GET requests to '/'


// Define route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile("./views/index.html");
});

// Define an API endpoint to generate a temporary email
app.post('/api/generate-email', async (req, res) => {
    try {
        // Call the function to generate a temporary email
        const email = await utils.createAccount();

        // Send the generated email back to the client
        res.json({ email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define an API endpoint to fetch messages from the inbox
app.get('/api/fetch-messages', async (req, res) => {
    try {
        // Call the function to fetch messages from the inbox
        const emails = await utils.fetchMessages();

        // Send the fetched emails back to the client
        res.json({ emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define an API endpoint to delete the account
app.delete('/api/delete-account', async (req, res) => {
  try {
      // Call the function to delete the account
      await utils.deleteAccount();

      // Send success response
      res.json({ message: 'Account deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Define an API endpoint to fetch details of the account
app.get('/api/view-details', async (req, res) => {
  try {
      // Call the function to fetch details of the account
      const details = await utils.showDetails();

      // Send details response
      res.json({ details });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
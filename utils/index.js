import fetch from "node-fetch";
import fs from "fs/promises";
import copy from "./copy.js";
import axios from "axios";
import { Low, JSONFile } from "lowdb";
import ora from "ora";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const adapter = new JSONFile(path.join(dirname, "../data/account.json"));

const db = new Low(adapter);

const createAccount = async () => {
  // start the spinner
  const spinner = ora("creating...").start();

  // read the account data from file
  await db.read();

  // if account already exists, then show message and return
  if (db.data !== null) {
    spinner.stop();
    console.log(`${chalk.redBright("Account already exists")}`);
    return;
  }

  // get the available email domains
  const response = await fetch("https://api.mail.tm/domains?page=1");
  const data = await response.json();
  const domain = data["hydra:member"][0].domain;
  // generate a random email address
  const email = `${Math.random().toString(36).substring(7)}@${domain}`;

  // generate a random password
  const password = Math.random().toString(36).substring(7);

  try {
    const accountResponse = await fetch("https://api.mail.tm/accounts", {
      method: 'POST',
      body: JSON.stringify({ address: email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const accountData = await accountResponse.json();

    // add password to the data object
    accountData.password = password;

    // copy the email to the clipboard
    await copy(email);

    const tokenResponse = await fetch("https://api.mail.tm/token", {
      method: 'POST',
      body: JSON.stringify({ address: email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const tokenData = await tokenResponse.json();

    // write token to a data object
    accountData.token = tokenData;

    //write the data object to the account.json file
    db.data = accountData;

    await db.write();

    // stop the spinner
    spinner.stop();

    console.log(
      `${chalk.blue("Account created")}: ${chalk.underline.green(email)}`
    );
    return email;
  } catch (error) {
    // stop the spinner
    spinner.stop();
    console.error(`${chalk.redBright("Error")}: ${error.message}`);
  }
};

const fetchMessages = async () => {
  // start the spinner
  const spinner = ora("fetching...").start();

  await db.read();

  const account = db.data;

  if (account === null) {
    // stop the spinner
    spinner.stop();

    console.log(`${chalk.redBright("Account not created yet")}`);

    return;
  }

  // get the messages
    const response = await fetch("https://api.mail.tm/messages", {
      headers: {
        Authorization: `Bearer ${account.token.token}`,
      },
    });

  
    const data = await response.json();
    const emails = data["hydra:member"];
  // stop the spinner
  spinner.stop();

  // if there are no emails, then there are no messages
  if (emails.length === 0) {
    console.log(`${chalk.redBright("No Emails")}`);
    return null;
  } else {
    return emails;
  }
};

const deleteAccount = async () => {
  // start the spinner
  const spinner = ora("deleting...").start();

  await db.read();

  const account = db.data;

  try {
    // if the account is null, then the account has not been created yet
    if (account === null) {
      // stop the spinner
      spinner.stop();

      console.log(`${chalk.redBright("Account not created yet")}`);
      return;
    }

    await fetch(`https://api.mail.tm/accounts/${account.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${account.token.token}`,
      },
    });

    // delete the account.json file
    await fs.unlink(path.join(dirname, "../data/account.json"));

    // stop the spinner
    spinner.stop();

    console.log(`${chalk.blue("Account deleted")}`);
  } catch (error) {
    console.error(error.message);
  }
};

const showDetails = async () => {
  // start the spinner
  const spinner = ora("fetching details...").start();

  await db.read();

  const account = db.data;

  // if the account is null then the account has not been created yet
  if (account === null) {
    // stop the spinner
    spinner.stop();

    console.log(`${chalk.redBright("Account not created yet")}`);
    return;
  }

  // get the account details
  const { data } = await fetch(
    `https://api.mail.tm/accounts/${account.id}`,
    {
      headers: {
        Authorization: `Bearer ${account.token.token}`,
      },
    }
  );

  // stop the spinner
  spinner.stop();

  // display the account details
  console.log(`
    Email: ${chalk.underline.green(data.address)}
    createdAt: ${chalk.green(new Date(data.createdAt).toLocaleString())}
  `);
};

// open specific email
const openEmail = async (email) => {
  try {
    // start the spinner
    const spinner = ora("opening...").start();

    await db.read();

    const account = db.data;

    const mails = await fetchMessages();

    const mailToOpen = mails[email - 1];

    // get email html content
    const { data } = await fetch(
      `https://api.mail.tm/messages/${mailToOpen.id}`,
      {
        headers: {
          Authorization: `Bearer ${account.token.token}`,
        },
      }
    );

    // write the email html content to a file
    await fs.writeFile(path.join(dirname, "../data/email.html"), data.html[0]);

    // open the email html file in the browser
    await open(path.join(dirname, "../data/email.html"));

    // stop the spinner
    spinner.stop();
  } catch (error) {
    // stop the spinner
    spinner.stop();

    console.error(`${chalk.redBright("Error")}: ${error.message}`);
  }
};

// export the functions using es6 syntax
const utils = {
  createAccount,
  fetchMessages,
  deleteAccount,
  showDetails,
  openEmail,
};

export default utils;

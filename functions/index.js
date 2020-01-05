// Set up Express
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

// Set up Firebase
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

app.get('/:id', async (req, res) => {
  const doc = await db
    .collection('links')
    .doc(req.params.id)
    .get();

  if (!doc.exists) {
    return res.status(404).send('Link does not exist');
  }

  const data = doc.data();

  return res.redirect(data.url);
});

app.post('/', async (req, res) => {
  // Create the link in Realtime Database
  if (req.method !== 'POST') {
    return res.status(405).send('Invalid HTTP method: ' + req.method);
  }

  const linkId =
    req.body.linkId ||
    Math.random()
      .toString(36)
      .substr(2, 6);
  const linkUrl = req.body.linkUrl;

  if (!linkUrl) {
    return res.status(400).send('No link URL specified');
  }

  const docRef = db.collection('links').doc(linkId);
  await docRef.set({
    id: linkId,
    url: linkUrl
  });

  return res.status(200).json({
    id: linkId,
    url: linkUrl
  });
});

exports.links = functions.https.onRequest(app);

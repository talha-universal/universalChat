importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAZquFuAauHVLepUosYgrnD8cKzHGhD4dI',
  projectId: 'chat-83494',
  messagingSenderId: '124771750685',
  appId: '1:124771750685:web:00cc42a2ad5408c9a087f4'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Update badge count in background
  clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({
      type: 'UPDATE_BADGE',
      count: 1 // Increment count
    }));
  });
});

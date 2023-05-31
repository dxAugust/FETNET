self.addEventListener('install', (event) => {
    
});

self.addEventListener('push', function(event) {
    var payload = event.data.text();
    
    event.waitUntil(
      // Показываем уведомление с заголовком и телом сообщения.
      self.registration.showNotification('My first spell', {
        body: payload,
        icon: "./img/logotype.png"
      })
    );
  });
// VAPID Keys para Web Push Notifications
// As chaves VAPID são usadas para identificar seu servidor de aplicação para o serviço de push
// NUNCA compartilhe a chave privada no frontend!

export const VAPID_PUBLIC_KEY = 'BEDENAz3fGhIJE53o3iHk1okSh6Rzzc8tVKqAuoDesDJCaL8iEWpHWnxHWp4_A5bKvxYOe5OVvNQLLJ9595hXbM';

// A chave privada deve ficar apenas no backend:
// Private Key: W2cGSwhBRF7R2HArqbawwJZjVaFcy0SbMYBGqm6UrpA

// Para regenerar as chaves VAPID, execute:
// node -e "const webpush = require('web-push'); const vapidKeys = webpush.generateVAPIDKeys(); console.log('Public Key:', vapidKeys.publicKey); console.log('Private Key:', vapidKeys.privateKey);"

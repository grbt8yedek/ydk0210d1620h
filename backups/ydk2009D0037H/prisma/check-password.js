const bcrypt = require('bcryptjs');

const hash = '$2a$10$jQGINtOHCiq.RBAoYQonwOkYjHDiutQYZGi5x/CWMWg2Oxs1JzaCy';
const password = 'test123';

bcrypt.compare(password, hash, (err, result) => {
  if (err) throw err;
  console.log('Şifre doğru mu?', result);
}); 
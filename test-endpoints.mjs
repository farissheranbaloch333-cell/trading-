import http from 'http';

const routes = ['/', '/robot', '/scanner', '/dashboard', '/signals', '/pricing'];

async function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, statusCode: res.statusCode, size: data.length });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing Server Routes...');
  for (const route of routes) {
    const res = await checkRoute(route);
    console.log(`Route [${route}]:`, res);
  }
}

run();

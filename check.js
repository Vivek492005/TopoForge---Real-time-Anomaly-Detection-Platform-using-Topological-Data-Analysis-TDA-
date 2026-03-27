import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('dist/index.html', 'utf-8');

// The file protocol needs absolute paths, so we need a server or intercept HTTP requests.
// Since jsdom might have issues loading modules, an easier way is to just use a local server and puppeteer.
console.log('JSDOM test initialized.');

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'boostbuilt2026!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'boostbuiltsecretkey';

// Databases (JSON Files)
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'assets'));
  },
  filename: (req, file, cb) => {
    // Save with unique name to prevent cache issues
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${basename}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

// Static files served from /public
app.use(express.static(path.join(__dirname, 'public')));

// Database Helpers
function loadContent() {
  if (!fs.existsSync(CONTENT_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

function saveContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
}

function saveLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

// Authentication check middleware
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  res.redirect('/admin/login');
}

// Helper to render HTML pages dynamically by replacing backend placeholders
function renderPage(req, res, pageName) {
  const filePath = path.join(__dirname, 'views', `${pageName}.html`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Page not found');
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const db = loadContent();

  // Dynamic SEO Injection
  const seoData = db.seo && db.seo[pageName] ? db.seo[pageName] : {};
  const metaTags = `
    <title>${seoData.title || 'Boost Built Contractor Systems'}</title>
    <meta name="description" content="${seoData.description || 'Web Design & Marketing Systems'}">
  `;
  html = html.replace(/<!-- BACKEND_MARKER: SEO_META_TAGS -->[\s\S]*?(?=<link)/i, metaTags);

  // Dynamic Custom Head Verification Tags & Tracking Scripts
  if (db.google && db.google.custom_head_tags) {
    html = html.replace('</head>', `${db.google.custom_head_tags}\n</head>`);
  }

  // Dynamic Google Map Embed Code
  if (db.google && db.google.maps_embed) {
    // Replace map placeholder
    html = html.replace(/<!-- BACKEND_MARKER: GOOGLE_MAPS_EMBED -->[\s\S]*?(?=<div class="contact-form-card"|<\/div>\s*<\/div>\s*<\/section>)/i, 
      `<!-- BACKEND_MARKER: GOOGLE_MAPS_EMBED -->\n<div style="width:100%; margin-bottom: 2rem;">${db.google.maps_embed}</div>`);
  }

  // Dynamic Homepage Content Replacements
  if (pageName === 'index') {
    if (db.homepage) {
      if (db.homepage.hero_title) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_TEXT: HERO_TITLE -->[\s\S]*?<\/h1>/i, 
          `<!-- BACKEND_MARKER: EDITABLE_TEXT: HERO_TITLE -->\n<h1 class="hero-title">${db.homepage.hero_title}</h1>`);
      }
      if (db.homepage.hero_description) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_TEXT: HERO_SUBTITLE -->[\s\S]*?<\/p>/i, 
          `<!-- BACKEND_MARKER: EDITABLE_TEXT: HERO_SUBTITLE -->\n<p class="hero-description">${db.homepage.hero_description}</p>`);
      }
      if (db.homepage.hero_graphic) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_IMAGE: HERO_GRAPHIC -->[\s\S]*?class="hero-graphic">/i, 
          `<!-- BACKEND_MARKER: EDITABLE_IMAGE: HERO_GRAPHIC -->\n<img src="${db.homepage.hero_graphic}" alt="Boost Built Trades and Contractors" class="hero-graphic">`);
      }
    }
  }

  // Dynamic Products Content Replacements
  if (pageName === 'products') {
    if (db.products) {
      if (db.products.product1_image) {
        html = html.replace(/<img src="assets\/portsmouth_kitchen_preview\.png".*?>/i, 
          `<img src="${db.products.product1_image}" alt="Portsmouth Kitchen Fitting Client Website Demo" style="border-radius: var(--border-radius-sm); border: 1px solid var(--color-gray-200); box-shadow: 0 15px 30px rgba(0,0,0,0.05);">`);
      }
      if (db.products.product2_image) {
        html = html.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-1511707171634-5f897ff02aa9.*?alt="Missed Call.*?>/i, 
          `<img src="${db.products.product2_image}" alt="Missed Call Textback Automation" style="border-radius: var(--border-radius-sm); border: 1px solid var(--color-gray-200); box-shadow: 0 15px 30px rgba(0,0,0,0.05);">`);
      }
      if (db.products.product3_image) {
        html = html.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-1460925895917-afdab827c52f.*?alt="Local SEO.*?>/i, 
          `<img src="${db.products.product3_image}" alt="Local SEO Google Business Pack" style="border-radius: var(--border-radius-sm); border: 1px solid var(--color-gray-200); box-shadow: 0 15px 30px rgba(0,0,0,0.05);">`);
      }
      if (db.products.product4_image) {
        html = html.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-1551836022-d5d88e9218df.*?alt="One Click.*?>/i, 
          `<img src="${db.products.product4_image}" alt="One Click Contractor Marketing" style="border-radius: var(--border-radius-sm); border: 1px solid var(--color-gray-200); box-shadow: 0 15px 30px rgba(0,0,0,0.05);">`);
      }
    }
  }

  // Dynamic Process Content Replacements
  if (pageName === 'process') {
    if (db.process) {
      if (db.process.step1_title) {
        html = html.replace(/<h3 class="timeline-title font-bold">Consultation Call<\/h3>/i, 
          `<h3 class="timeline-title font-bold">${db.process.step1_title}</h3>`);
      }
      if (db.process.step1_desc) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_1 -->[\s\S]*?<\/p>/i, 
          `<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_1 -->\n<p class="text-muted" style="margin-bottom: 1rem;">${db.process.step1_desc}</p>`);
      }
      if (db.process.step2_title) {
        html = html.replace(/<h3 class="timeline-title font-bold">Buildout<\/h3>/i, 
          `<h3 class="timeline-title font-bold">${db.process.step2_title}</h3>`);
      }
      if (db.process.step2_desc) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_2 -->[\s\S]*?<\/p>/i, 
          `<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_2 -->\n<p class="text-muted" style="margin-bottom: 1rem;">${db.process.step2_desc}</p>`);
      }
      if (db.process.step3_title) {
        html = html.replace(/<h3 class="timeline-title font-bold">Launch<\/h3>/i, 
          `<h3 class="timeline-title font-bold">${db.process.step3_title}</h3>`);
      }
      if (db.process.step3_desc) {
        html = html.replace(/<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_3 -->[\s\S]*?<\/p>/i, 
          `<!-- BACKEND_MARKER: EDITABLE_TEXT: PROCESS_STEP_3 -->\n<p class="text-muted" style="margin-bottom: 1rem;">${db.process.step3_desc}</p>`);
      }
    }
  }

  // Inject a link in the footer bottom links pointing to /admin
  html = html.replace(/<!-- BACKEND_MARKER: ADMIN_LOGIN_LINK -->/g, 
    `<a href="/admin" class="footer-link" style="opacity: 0.5;"><i class="fa-solid fa-lock"></i> CRM Login</a>`);

  res.send(html);
}

// Front-End Routes
app.get('/', (req, res) => renderPage(req, res, 'index'));
app.get('/index.html', (req, res) => res.redirect('/'));

app.get('/products', (req, res) => renderPage(req, res, 'products'));
app.get('/products.html', (req, res) => res.redirect('/products'));

app.get('/process', (req, res) => renderPage(req, res, 'process'));
app.get('/process.html', (req, res) => res.redirect('/process'));

app.get('/trades', (req, res) => renderPage(req, res, 'trades'));
app.get('/trades.html', (req, res) => res.redirect('/trades'));

app.get('/contact', (req, res) => renderPage(req, res, 'contact'));
app.get('/contact.html', (req, res) => res.redirect('/contact'));

// Form Lead Submission Endpoint
app.post('/api/leads', (req, res) => {
  const { name, email, phone, trade, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Name, Email, and Phone fields are required.' });
  }

  const leads = loadLeads();
  const newLead = {
    id: `lead_${Date.now()}`,
    date: new Date().toISOString(),
    name,
    email,
    phone,
    trade: trade || 'Not Selected',
    message: message || ''
  };

  leads.unshift(newLead); // Add to beginning of array
  saveLeads(leads);

  res.json({ success: true, message: 'Lead saved successfully!' });
});

// Admin Panel Login Routes
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.redirect('/admin');
  }
  const filePath = path.join(__dirname, 'views', 'login.html');
  res.sendFile(filePath);
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    return res.redirect('/admin');
  }

  // Redirect back with login error
  res.send(`
    <script>
      alert("Invalid admin credentials. Please try again.");
      window.location.href = "/admin/login";
    </script>
  `);
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Admin Dashboard Route
app.get('/admin', requireLogin, (req, res) => {
  const filePath = path.join(__dirname, 'views', 'dashboard.html');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Dashboard template not found');
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const db = loadContent();
  const leads = loadLeads();

  // Inject current configuration data into script tag
  const dataScript = `
    <script>
      window.CRM_CONTENT = ${JSON.stringify(db)};
      window.CRM_LEADS = ${JSON.stringify(leads)};
    </script>
  `;
  html = html.replace('<!-- BACKEND_MARKER: DATA_INJECTION -->', dataScript);

  res.send(html);
});

// CRM Edit Settings Endpoints
app.post('/admin/save-content', requireLogin, (req, res) => {
  const db = loadContent();
  const { section, ...fields } = req.body;

  if (!section) {
    return res.status(400).send('Section identifier is required.');
  }

  if (section === 'seo') {
    db.seo = db.seo || {};
    const { page, title, description } = fields;
    if (page) {
      db.seo[page] = { title, description };
    }
  } else if (section === 'google') {
    db.google = db.google || {};
    db.google.maps_embed = fields.maps_embed;
    db.google.custom_head_tags = fields.custom_head_tags;
  } else if (db[section]) {
    // Generic direct sections (homepage, products, process)
    Object.keys(fields).forEach(key => {
      db[section][key] = fields[key];
    });
  } else {
    // Initialize section if not exists
    db[section] = fields;
  }

  saveContent(db);
  res.redirect('/admin?save=success&tab=' + (req.query.tab || 'site-text'));
});

// CRM Image Upload Endpoint
app.post('/admin/upload-image', requireLogin, upload.single('image_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { target_field } = req.body;
  if (!target_field) {
    return res.status(400).send('Target field is required.');
  }

  const relativePath = `assets/${req.file.filename}`;
  const db = loadContent();

  if (target_field === 'hero_graphic') {
    db.homepage = db.homepage || {};
    db.homepage.hero_graphic = relativePath;
  } else if (target_field.startsWith('product')) {
    db.products = db.products || {};
    db.products[target_field] = relativePath;
  }

  saveContent(db);
  res.redirect('/admin?save=success&tab=site-images');
});

// CRM Leads Management Endpoint (Delete Lead)
app.post('/admin/delete-lead', requireLogin, (req, res) => {
  const { lead_id } = req.body;
  if (!lead_id) {
    return res.status(400).send('Lead ID is required.');
  }

  let leads = loadLeads();
  leads = leads.filter(lead => lead.id !== lead_id);
  saveLeads(leads);

  res.redirect('/admin?save=success&tab=leads');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Boost Built server running on http://localhost:${PORT}`);
});

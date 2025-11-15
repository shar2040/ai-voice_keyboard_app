# Railway Deployment Guide - Complete Step-by-Step

Complete step-by-step guide to deploy the AI Voice Keyboard App to Railway.app. This guide assumes you know nothing about Railway and will walk you through everything.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with your code repository (or create one)
- ✅ Railway.app account ([Sign up here](https://railway.app) - free tier available)
- ✅ Neon PostgreSQL database ([Sign up here](https://neon.tech) - free tier available)
- ✅ Groq API key ([Get one here](https://console.groq.com))

**Time Required**: 15-30 minutes

---

## 🚀 Complete Step-by-Step Deployment

### Step 1: Set Up Neon PostgreSQL Database

**What is Neon?** Neon is a serverless PostgreSQL database. It's free and perfect for this app.

**Detailed Steps:**

1. **Go to Neon Website**:
   - Open your browser
   - Go to [neon.tech](https://neon.tech)
   - Click "Sign Up" (top right)

2. **Create Account**:
   - You can sign up with GitHub, Google, or email
   - Choose the easiest option for you
   - Complete the signup process

3. **Create New Project**:
   - After logging in, you'll see a dashboard
   - Click the big green button "Create Project" (or "New Project")
   - **Project Name**: Enter something like "voice-keyboard-db" or "ai-voice-app"
   - **Region**: Choose the region closest to you (e.g., "US East" if you're in the US)
   - **PostgreSQL Version**: Leave as default (usually 15 or 16)
   - Click "Create Project"

4. **Get Connection String**:
   - After creating the project, you'll see a dashboard
   - Look for a section called "Connection Details" or "Connection String"
   - You'll see two options:
     - **Pooled connection** (recommended) - Use this one
     - **Direct connection** - Don't use this
   - Click "Copy" next to the pooled connection string
   - It looks like: `postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require`
   - **Save this somewhere safe** - you'll need it in Step 5

5. **Verify Database is Running**:
   - In the Neon dashboard, you should see "Active" status
   - If you see any errors, wait a minute and refresh

**✅ Checkpoint**: You should have a Neon database connection string saved.

---

### Step 2: Get Groq API Key

**What is Groq?** Groq provides fast AI transcription using Whisper. We need an API key to use it.

**Detailed Steps:**

1. **Go to Groq Console**:
   - Open your browser
   - Go to [console.groq.com](https://console.groq.com)
   - Click "Sign Up" or "Login"

2. **Create Account**:
   - Sign up with email or Google
   - Complete the signup process
   - Verify your email if required

3. **Navigate to API Keys**:
   - After logging in, look for "API Keys" in the left sidebar
   - Click on "API Keys"
   - You'll see a page with your API keys (probably empty if new)

4. **Create New API Key**:
   - Click the button "Create API Key" or "+ New API Key"
   - **Name**: Enter something like "Voice Keyboard App" or "My Transcription App"
   - Click "Create" or "Submit"

5. **Copy API Key Immediately**:
   - **IMPORTANT**: The API key will be shown only once!
   - It starts with `gsk_` followed by a long string
   - Click "Copy" or select and copy it
   - **Save this somewhere safe** - you'll need it in Step 5
   - If you lose it, you'll need to create a new one

6. **Verify API Key**:
   - The API key should look like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - It's about 50-60 characters long
   - If it's shorter or doesn't start with `gsk_`, something went wrong

**✅ Checkpoint**: You should have a Groq API key (starts with `gsk_`) saved.

---

### Step 3: Push Code to GitHub

**What is GitHub?** GitHub is where we store our code. Railway needs to access it from GitHub.

**Detailed Steps:**

1. **Check if Code is Already on GitHub**:
   - If your code is already on GitHub, skip to Step 4
   - If not, continue below

2. **Initialize Git (if not done)**:
   ```bash
   # Open terminal/command prompt in your project folder
   # Navigate to your project:
   cd "AI Voice Keyboard App"
   
   # Check if git is initialized:
   git status
   
   # If you see "not a git repository", initialize it:
   git init
   ```

3. **Create .gitignore (if not exists)**:
   - Make sure `.env.local` is in `.gitignore`
   - Create `.gitignore` file if it doesn't exist:
   ```bash
   # In your project root, create .gitignore:
   echo ".env.local" >> .gitignore
   echo "node_modules" >> .gitignore
   echo ".next" >> .gitignore
   ```

4. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Sign in or create account
   - Click the "+" icon (top right) → "New repository"
   - **Repository name**: `ai-voice-keyboard-app` (or any name you like)
   - **Description**: "AI Voice Keyboard App - Speech to Text"
   - Choose **Public** or **Private** (your choice)
   - **DO NOT** check "Initialize with README" (we already have code)
   - Click "Create repository"

5. **Push Code to GitHub**:
   ```bash
   # In your project folder, run:
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - AI Voice Keyboard App"
   
   # Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

6. **Verify Code is on GitHub**:
   - Go to your GitHub repository page
   - You should see all your files
   - Make sure `.env.local` is NOT visible (it should be ignored)

**✅ Checkpoint**: Your code should be on GitHub and visible in your repository.

---

### Step 4: Create Railway Project

**What is Railway?** Railway is a hosting platform that runs your app. It's free to start and easy to use.

**Detailed Steps:**

1. **Go to Railway Website**:
   - Open your browser
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project" or "Login"

2. **Sign Up/Login**:
   - Click "Login with GitHub" (easiest option)
   - Authorize Railway to access your GitHub account
   - Complete the signup process

3. **Create New Project**:
   - After logging in, you'll see a dashboard
   - Click the big button "New Project" (usually top right or center)
   - You'll see options:
     - "Deploy from GitHub repo" ← **Choose this one**
     - "Empty Project" (don't choose this)
     - "Deploy a Template" (don't choose this)

4. **Connect GitHub Repository**:
   - Railway will show a list of your GitHub repositories
   - Find your repository (the one you pushed in Step 3)
   - Click on it to select it
   - Railway will automatically detect it's a Next.js app

5. **Start Deployment**:
   - Railway will show a preview of your project
   - Click "Deploy" button
   - Railway will start building your app automatically
   - You'll see a progress bar and logs

6. **Wait for Initial Build**:
   - This takes 2-5 minutes
   - You'll see build logs in real-time
   - **Don't worry if it fails** - we need to add environment variables first
   - The build might fail with "DATABASE_URL not found" - this is normal!

**✅ Checkpoint**: Railway project created and initial deployment started (may fail, that's OK).

---

### Step 5: Configure Environment Variables

**What are Environment Variables?** These are secret keys and configuration that your app needs to run. Railway stores them securely.

**Detailed Steps:**

1. **Open Railway Project**:
   - In Railway dashboard, click on your project
   - You'll see a service (usually named after your repo)
   - Click on the service

2. **Go to Variables Tab**:
   - Look for tabs: "Deployments", "Metrics", "Variables", "Settings"
   - Click on **"Variables"** tab
   - You'll see an empty list or some default variables

3. **Add DATABASE_URL**:
   - Click "New Variable" button
   - **Variable Name**: `DATABASE_URL` (exactly like this, case-sensitive)
   - **Value**: Paste your Neon connection string from Step 1
     - Should look like: `postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require`
   - Click "Add" or "Save"
   - ✅ You should see it in the list

4. **Add GROQ_API_KEY**:
   - Click "New Variable" again
   - **Variable Name**: `GROQ_API_KEY` (exactly like this, case-sensitive)
   - **Value**: Paste your Groq API key from Step 2
     - Should start with `gsk_` and be about 50-60 characters
   - Click "Add" or "Save"
   - ✅ You should see it in the list

5. **Generate JWT_SECRET**:
   - Open your terminal/command prompt
   - Run one of these commands:
   
   **Mac/Linux:**
   ```bash
   openssl rand -base64 32
   ```
   
   **Windows (PowerShell):**
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
   
   - Copy the output (it's a long random string)
   - **Save it** - you'll need it in the next step

6. **Add JWT_SECRET**:
   - In Railway, click "New Variable" again
   - **Variable Name**: `JWT_SECRET` (exactly like this, case-sensitive)
   - **Value**: Paste the random string you just generated
   - Click "Add" or "Save"
   - ✅ You should see it in the list

7. **Add NODE_ENV** (Optional but recommended):
   - Click "New Variable" again
   - **Variable Name**: `NODE_ENV`
   - **Value**: `production`
   - Click "Add" or "Save"

8. **Verify All Variables**:
   - You should now have these variables:
     - ✅ `DATABASE_URL`
     - ✅ `GROQ_API_KEY`
     - ✅ `JWT_SECRET`
     - ✅ `NODE_ENV` (optional)
   - **Double-check** the names are exactly correct (case-sensitive!)

9. **Railway Will Auto-Redeploy**:
   - After adding variables, Railway automatically starts a new deployment
   - You'll see a new deployment in the "Deployments" tab
   - Wait for it to complete (2-5 minutes)

**✅ Checkpoint**: All environment variables added and new deployment started.

---

### Step 6: Initialize Database Schema

**What is this?** We need to create tables in the database (users, transcriptions, dictionary). The database is empty right now.

**Detailed Steps:**

1. **Go to Neon Dashboard**:
   - Go back to [console.neon.tech](https://console.neon.tech)
   - Click on your project (the one you created in Step 1)

2. **Open SQL Editor**:
   - In the left sidebar, click "SQL Editor"
   - You'll see a code editor with a query box

3. **Open Schema File**:
   - In your local project folder, open `scripts/01-init-schema.sql`
   - Select all the content (Ctrl+A or Cmd+A)
   - Copy it (Ctrl+C or Cmd+C)

4. **Paste into Neon SQL Editor**:
   - Go back to Neon SQL Editor
   - Click in the editor (or clear any existing text)
   - Paste the schema (Ctrl+V or Cmd+V)
   - You should see SQL code creating tables

5. **Run the Schema**:
   - Click the "Run" button (usually top right)
   - Or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait a few seconds

6. **Verify Success**:
   - You should see a "Success" message
   - If you see errors, check:
     - Did you copy the entire file?
     - Are there any syntax errors?
     - Try running it again

7. **Verify Tables Created**:
   - In Neon SQL Editor, run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   - You should see: `dictionary`, `transcriptions`, `users`
   - If you see these, ✅ success!

**✅ Checkpoint**: Database tables created and verified.

---

### Step 7: Get Your App URL

**What is this?** Railway gives you a URL where your app is live. Let's find it.

**Detailed Steps:**

1. **Go to Railway Dashboard**:
   - Go back to [railway.app](https://railway.app)
   - Click on your project
   - Click on your service

2. **Find Domain**:
   - Look for "Settings" tab, click it
   - Scroll down to "Networking" section
   - You'll see "Generate Domain" button - click it
   - Railway will generate a domain like: `your-app-name.up.railway.app`
   - **Copy this URL** - this is your live app!

3. **Wait for Deployment**:
   - Make sure the latest deployment is "Active" (green checkmark)
   - If it's still building, wait for it to finish
   - Check "Deployments" tab to see status

4. **Test the URL**:
   - Open the URL in a new browser tab
   - You should see the login page of your app
   - If you see an error, check the next section

**✅ Checkpoint**: You have your app URL and can access it in browser.

---

### Step 8: Test Your Deployed App

**What is this?** Let's make sure everything works on the live site.

**Detailed Steps:**

1. **Open Your App**:
   - Go to your Railway app URL (from Step 7)
   - You should see the login page

2. **Sign Up**:
   - Click "Sign up" link
   - Enter:
     - **Name**: Test User
     - **Email**: test@example.com (or any email)
     - **Password**: testpassword123 (minimum 8 characters)
   - Click "Sign Up"
   - ✅ Should redirect to dashboard

3. **Test Recording**:
   - Click the microphone button
   - **Allow microphone access** when browser asks
   - Speak for 10+ seconds
   - Watch transcription appear in real-time
   - Click button again to stop
   - ✅ Should see final transcription

4. **Test History**:
   - Go to "History" tab
   - ✅ Should see your transcription
   - Click "Copy" button
   - ✅ Should copy to clipboard

5. **Test Dictionary**:
   - Go to "Dictionary" tab
   - Enter word: "test"
   - Click "+ Add Word"
   - ✅ Should appear in list

6. **Test Settings**:
   - Go to "Settings" tab
   - Toggle dark/light mode
   - ✅ Should change theme

**✅ Checkpoint**: All features working on live site!

---

## 🔧 Troubleshooting

### Build Fails

**Error**: "Build failed" or "Module not found"

**Solution**:
1. Check Railway logs in "Deployments" tab
2. Click on the failed deployment
3. Look for error messages
4. Common issues:
   - Missing dependencies → Check `package.json`
   - Wrong Node.js version → Railway auto-detects, but check if needed
   - Syntax errors → Check your code

### Database Connection Failed

**Error**: "Database connection failed" or "Connection refused"

**Solution**:
1. Verify `DATABASE_URL` in Railway Variables:
   - Go to Railway → Your Service → Variables
   - Check `DATABASE_URL` is correct
   - Should include `?sslmode=require`
2. Check Neon dashboard:
   - Go to Neon → Your Project
   - Make sure database is "Active"
   - Try regenerating connection string
3. Verify database schema is run:
   - Go to Neon SQL Editor
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Should see: `users`, `transcriptions`, `dictionary`

### Transcription Not Working

**Error**: "Failed to transcribe audio" or 500 error

**Solution**:
1. Verify `GROQ_API_KEY` in Railway Variables:
   - Go to Railway → Your Service → Variables
   - Check `GROQ_API_KEY` is set
   - Should start with `gsk_`
2. Check Groq console:
   - Go to [console.groq.com](https://console.groq.com)
   - Check API usage/quota
   - Make sure you haven't exceeded limits
3. Check Railway logs:
   - Go to Railway → Deployments → Latest
   - Look for Groq API errors
   - Check error messages

### 401 Unauthorized Errors

**Error**: "Unauthorized" or "Token expired"

**Solution**:
1. Verify `JWT_SECRET` in Railway Variables:
   - Go to Railway → Your Service → Variables
   - Check `JWT_SECRET` is set
   - Should be a long random string
2. Clear browser data:
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Clear all data
   - Try signing up again
3. Check Railway logs for JWT errors

### CORS Errors

**Error**: "CORS policy" or "Access-Control-Allow-Origin"

**Solution**:
1. Railway provides HTTPS automatically (required)
2. Make sure you're accessing via HTTPS (not HTTP)
3. Check `CORS_ORIGINS` variable (optional, defaults to `*`)

### Microphone Not Working

**Error**: "Failed to access microphone"

**Solution**:
1. Browser requires HTTPS for microphone (Railway provides this)
2. Check browser permissions:
   - Browser Settings → Privacy → Microphone
   - Allow microphone access
3. Try Chrome browser (best compatibility)
4. Check browser console (F12) for specific errors

### App Shows Blank Page

**Error**: Blank page or "This site can't be reached"

**Solution**:
1. Check deployment status:
   - Railway → Deployments
   - Make sure latest deployment is "Active" (green)
2. Check build logs:
   - Click on deployment
   - Look for build errors
3. Verify environment variables are set
4. Try redeploying:
   - Railway → Deployments → "Redeploy"

---

## 📊 Monitoring & Logs

### View Logs

1. **In Railway**:
   - Go to Railway → Your Project → Your Service
   - Click "Deployments" tab
   - Click on latest deployment
   - View real-time logs

2. **What to Look For**:
   - Build logs (during deployment)
   - Runtime logs (when app is running)
   - Error messages (if something fails)

### Monitor Metrics

1. **In Railway**:
   - Go to Railway → Your Service
   - Click "Metrics" tab
   - View:
     - CPU usage
     - Memory usage
     - Network traffic
     - Request count

### Check Database

1. **In Neon**:
   - Go to Neon → Your Project
   - Click "SQL Editor"
   - Run queries:
   ```sql
   -- Check users
   SELECT COUNT(*) FROM users;
   
   -- Check transcriptions
   SELECT COUNT(*) FROM transcriptions;
   
   -- Check dictionary
   SELECT COUNT(*) FROM dictionary;
   ```

---

## ✅ Production Checklist

Before considering your app production-ready:

- [ ] All environment variables set in Railway
- [ ] Database schema initialized in Neon
- [ ] Test account created and working
- [ ] Microphone recording works
- [ ] Transcription completes successfully
- [ ] History saves and displays correctly
- [ ] Dictionary words save and improve transcription
- [ ] Copy to clipboard works
- [ ] Logout works correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Railway)
- [ ] Error handling works (test with invalid inputs)
- [ ] JWT tokens expire correctly (7 days)

---

## 🔒 Security Best Practices

1. **JWT Secret**: Use a strong, random secret (32+ characters) - ✅ You did this in Step 5
2. **Database**: Use connection pooling (Neon provides this) - ✅ You're using pooled connection
3. **API Keys**: Never commit API keys to git - ✅ `.env.local` is in `.gitignore`
4. **HTTPS**: Railway provides SSL automatically - ✅ Your app uses HTTPS
5. **CORS**: Restrict `CORS_ORIGINS` to your domain in production (optional)

---

## 📈 Scaling

### Railway Free Tier Limits

- **Builds**: Unlimited
- **Deployments**: Unlimited
- **Bandwidth**: 100GB/month
- **Usage**: $5 credit/month

### When to Upgrade

- High traffic (>1000 concurrent users)
- Large audio files
- Need faster builds
- Need more bandwidth

### Upgrade Steps

1. Go to Railway project → "Settings"
2. Click "Upgrade" or "Change Plan"
3. Select plan (Starter, Developer, etc.)
4. Follow payment setup

---

## 🧹 Cleanup

### Delete Railway Project

1. Go to Railway dashboard
2. Click on your project
3. Go to "Settings"
4. Scroll to "Danger Zone"
5. Click "Delete Project"
6. Confirm deletion

### Delete Neon Database

1. Go to Neon dashboard
2. Click on your project
3. Go to "Settings"
4. Click "Delete Project"
5. Confirm deletion

**⚠️ Warning**: This will delete all data permanently!

---

## 🆘 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Groq Docs**: [console.groq.com/docs](https://console.groq.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Success!

If you've completed all steps, your AI Voice Keyboard App should be live on Railway!

**Your app URL**: `https://your-app-name.up.railway.app`

**What You've Accomplished**:
- ✅ Set up Neon PostgreSQL database
- ✅ Got Groq API key
- ✅ Pushed code to GitHub
- ✅ Deployed to Railway
- ✅ Configured environment variables
- ✅ Initialized database schema
- ✅ Tested live app

**Share it with others and start transcribing!** 🎤✨

---

**Need Help?** Check the troubleshooting section above or reach out to Railway/Neon support.

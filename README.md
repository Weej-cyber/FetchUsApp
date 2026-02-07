# FetchUs - Dog Walking Service App

## Quick Start for Deployment

### Prerequisites
- GitHub account
- Vercel account (free - sign up at vercel.com)

### Step-by-Step Deployment

#### 1. Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - FetchUs app"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/fetchus.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository (fetchus)
4. Vercel will auto-detect it's a Vite app
5. Click "Deploy"
6. Wait 2-3 minutes for deployment

#### 3. Run Database Setup (ONE TIME ONLY)
1. Once deployed, open your app URL (Vercel will give you something like `fetchus.vercel.app`)
2. You'll see the "FetchUs Database Setup" page
3. Click "Create Database Tables"
4. Wait for all green checkmarks
5. Click "Continue to App"

That's it! Your app is now live and the database is set up.

### What This App Contains

- **Database Setup**: Automatic creation of all tables
- **Tables Created**:
  - users (clients, walkers, admin)
  - dogs  
  - walks
  - walk_reports
  - broadcast_messages
- **Test Data**: Includes sample users for testing
- **PWA Ready**: Can be added to phone home screen

### Next Steps

After deployment, the full app interface will be built with:
- Client portal (book walks, view dogs)
- Walker interface (view schedule, submit walk reports)
- Admin dashboard (manage bookings, send broadcasts)

### Supabase Configuration

Your Supabase credentials are already configured in the app:
- Project URL: https://rwauwkrdzcesyhwpaeow.supabase.co
- Keys are embedded in `src/lib/supabase.js`

### Support

If database setup fails, check:
1. Supabase project is active
2. Service role key is valid
3. Project URL is correct

Contact Clarence for any issues.

# 🚀 GitHub Repository Setup Instructions

Follow these steps to create and push this code to a new GitHub repository:

## Step 1: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Configure your repository:
   - **Repository name**: `batshit-or-not` (or your preferred name)
   - **Description**: "A community-driven platform where users submit wild ideas and rate them on a batshit crazy scale"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Copy Your Repository URL

After creating, GitHub will show you the repository URL. It will look like:
- HTTPS: `https://github.com/YOUR_USERNAME/batshit-or-not.git`
- SSH: `git@github.com:YOUR_USERNAME/batshit-or-not.git`

## Step 3: Add Remote and Push

Run these commands in your terminal (replace with your repository URL):

```bash
# Add your GitHub repository as the remote origin
git remote add origin https://github.com/YOUR_USERNAME/batshit-or-not.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main
```

If you're using SSH instead of HTTPS:
```bash
git remote add origin git@github.com:YOUR_USERNAME/batshit-or-not.git
git push -u origin main
```

## Step 4: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README.md should be displayed on the main page

## Step 5: Create Development Branch (for staging)

Since FlightControl uses different branches for environments:

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop

# Switch back to main
git checkout main
```

## Troubleshooting

### If you get "remote origin already exists" error:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin YOUR_REPOSITORY_URL
```

### If you get authentication errors with HTTPS:

1. Use a Personal Access Token instead of password:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with "repo" scope
   - Use this token as your password when pushing

2. Or switch to SSH:
   - [Set up SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
   - Use the SSH URL instead

### If you need to change the default branch name:
```bash
# Rename branch locally
git branch -m master main

# Push with the new name
git push -u origin main

# Update default branch on GitHub:
# Go to Settings → Branches → Change default branch
```

## Next Steps

Once your code is on GitHub:

1. **Set up FlightControl deployment**:
   - Follow the instructions in `DEPLOYMENT.md`
   - Connect your GitHub repository to FlightControl

2. **Configure GitHub Settings** (optional):
   - Add branch protection rules for `main`
   - Set up GitHub Actions for CI/CD
   - Add collaborators if working with a team

3. **Add Badges to README** (optional):
   Add these to your README.md for a professional look:
   ```markdown
   ![GitHub](https://img.shields.io/github/license/YOUR_USERNAME/batshit-or-not)
   ![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/batshit-or-not)
   ![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/batshit-or-not)
   ```

## Repository Structure Verification

Your repository should have this structure:
```
batshit-or-not/
├── client/               # React frontend
├── server/              # Express backend
├── shared/              # Shared types
├── scripts/             # Deployment scripts
├── .flightcontrol/      # FlightControl configs
├── .dockerignore
├── .env.example
├── .gitignore
├── DEPLOYMENT.md
├── README.md
├── flightcontrol.json
├── package.json
└── ... other config files
```

---

## 🎉 Congratulations!

Your code is now on GitHub and ready for deployment to AWS via FlightControl!
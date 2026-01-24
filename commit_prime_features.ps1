
# Auto-commit script for Prime features
git add backend/core/settings.py
git add backend/requirements.txt
git add backend/users/models.py
git add backend/users/serializers.py
git add backend/users/urls.py
git add backend/users/email_templates.py
git add backend/users/migrations/0029_user_hire_now_user_is_prime_user_prime_expiry.py
git add backend/users/payment_views.py
git add frontend/src/App.tsx
git add frontend/src/Components/DashboardLayout.tsx
git add frontend/src/Components/Header.tsx
git add frontend/src/Components/NotificationBell.tsx
git add frontend/src/Components/PrimeBadge.tsx
git add frontend/src/auth/AuthContext.tsx
git add frontend/src/main.tsx
git add frontend/src/pages/CommunityPage.tsx
git add frontend/src/pages/HomePage.tsx
git add frontend/src/pages/PublicProfile.tsx
git add frontend/src/pages/UpgradePage.tsx
git add frontend/src/theme.ts
git add frontend/src/theme/ThemeContext.tsx

git commit -m "feat: Implement Prime Membership (Golden Theme, Email, Payment)"
echo "Changes committed successfully!"

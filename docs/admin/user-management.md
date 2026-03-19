# User Management

## Roles

| Role          | Access Level |
| ------------- | ------------ |
| `user`        | Practice user — sees only their assigned practices, can submit/confirm assets |
| `admin`       | Can manage campaigns, request assets, see all practices they're assigned to |
| `super_admin` | Full access — can manage users, see all practices, configure the system |

## How to Add a User

### Via Admin Panel
1. Go to **Admin** → **People & Access**
2. Click **Add User** (top right)
3. Fill in email, first name, last name, and role
4. The user will be added to `allowed_users` and can log in via Microsoft

### Via CSV Upload
1. Go to **Admin** → **People & Access**
2. Click the **CSV Upload** button
3. Upload a CSV with columns: `email`, `first_name`, `last_name`, `role`, `practice_id`
4. This uses the `bulk_upsert_allowed_users_with_practices` RPC

## How to Change a User's Role

### Via Admin Panel
1. Go to **Admin** → **People & Access**
2. Find the user in the table
3. Click the edit action on their row
4. Change the role dropdown

### Via Supabase Dashboard
1. Go to **Table Editor** → `allowed_users`
2. Find the user by email
3. Edit the `role` column (valid values: `user`, `admin`, `super_admin`)

## How to Assign a User to a Practice

### Via Admin Panel
Practice assignments are managed through the People & Access page or when creating/editing a user.

### Via Supabase Dashboard
1. Go to **Table Editor** → `practice_members`
2. Insert a new row with:
   - `practice_id` — the practice UUID
   - `email` — the user's email
   - `user_id` — the user's UUID from `allowed_users`
   - `role` — typically `user`

## How to Remove a User

### Via Admin Panel
1. Go to **Admin** → **People & Access**
2. Find the user and use the delete action

### Via Supabase Dashboard
1. Delete the row from `allowed_users` (this cascades to remove their `practice_members` entries)

::: warning
Deleting from `allowed_users` prevents the user from logging in. Their existing notifications and history remain in the database.
:::

## Tables Involved

| Table              | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `allowed_users`    | Whitelist of users who can access the app |
| `practice_members` | Links users to practices (many-to-many)   |

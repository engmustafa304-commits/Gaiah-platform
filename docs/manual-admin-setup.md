# Manual System Admin Setup

Use this process to create the first `system_admin` manually. No bootstrap Cloud Function or custom claims are used in this stage.

## Steps

1. Open Firebase Console for the `gaiah-platform` project.
2. Go to Authentication and create the admin user manually.
3. Copy the new user's UID from Firebase Authentication.
4. Go to Firestore and create `admins/{uid}`.
5. Go to Firestore and create `users/{uid}`.

Use the same UID as the document ID in both collections.

## Required Fields

Add these fields to both `admins/{uid}` and `users/{uid}`:

```json
{
  "uid": "PASTE_AUTH_UID_HERE",
  "email": "admin@example.com",
  "role": "system_admin",
  "status": "active",
  "displayName": "Admin Name",
  "createdAt": "Firestore server timestamp",
  "updatedAt": "Firestore server timestamp"
}
```

For `createdAt` and `updatedAt`, use Firestore Timestamp values in the Firebase Console.

## Notes

- Custom claims are not used yet.
- Admin checks currently read Firestore document `admins/{uid}`.
- The user is treated as a system admin only when `role` is `system_admin` and `status` is `active`.
- Later, a Cloud Function can be added to sync Firestore roles into custom claims if needed.

import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

// Calling /users/me ensures the backend's local profile-mirror row exists
// for this Keycloak identity (created on first call — see UserServiceImpl on
// the backend). Most pages don't need this since authStore already has
// enough from the token, but it's useful wherever you need the backend's
// view of the user (e.g. its generated id for foreign keys).
export function useCurrentUser() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService
      .getMe()
      .then(setProfile)
      .catch(() => setError('Could not sync user profile.'));
  }, []);

  return { profile, error };
}

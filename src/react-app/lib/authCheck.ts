import { redirect, ParsedLocation } from '@tanstack/react-router';
import { ADMIN_ROLE } from '@shared/roles';


const authCheck = (roles: string[] = []) => {
  return async ({ location }: { location: ParsedLocation }) => {
    const notAuthenticated = !localStorage.getItem('JWT_TOKEN');
    const role = localStorage.getItem('USER_ROLE');
    const notAuthorized = roles.length > 0 && !roles.includes(role || '') && role !== ADMIN_ROLE;
    const requireProfileUpdate = localStorage.getItem('REQUIRE_PROFILE_UPDATE') === 'true';

    if (notAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      })
    } else if (notAuthorized) {
      throw redirect({
        to: '/unauthorized',
      })
    } else if (requireProfileUpdate && location.pathname !== '/settings/profile') {
      throw redirect({
        to: '/settings/profile',
      })
    }
  }
}

export default authCheck;

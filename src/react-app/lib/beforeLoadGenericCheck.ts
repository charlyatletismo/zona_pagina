import { redirect, ParsedLocation } from '@tanstack/react-router';

const unprotectedCheck = () => {
  return async ({ location }: { location: ParsedLocation }) => {
    // Add any generic checks here if needed in the future
    const requireProfileUpdate = localStorage.getItem('REQUIRE_PROFILE_UPDATE') === 'true';
    if (requireProfileUpdate && location.pathname !== '/settings/profile') {
      throw redirect({
        to: '/settings/profile',
      })
    }
  }
}

export default unprotectedCheck;

import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARBanStatusSchema } from '@shared/apiRespTypes';
import z from 'zod';


export const checkBanned = async () => {
  const resBanned = await getAuthenticatedThrow<
    z.infer<typeof ARBanStatusSchema>
    >(`/api/settings/banned`, ARBanStatusSchema);
  if (resBanned.status === 200 && resBanned.body.data.banned) {
    localStorage.setItem('BANNED', 'true');
    localStorage.setItem('BAN_REASON', resBanned.body.data.ban_reason || '');
  } else {
    localStorage.setItem('BANNED', 'false');
    localStorage.removeItem('BAN_REASON');
  }
}

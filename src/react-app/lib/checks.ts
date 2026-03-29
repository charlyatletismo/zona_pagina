import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARUpdatesStatusSchema } from '@shared/apiRespTypes';
import { clearUserInfo } from './utils';
import z from 'zod';


export const checkUpdates = async () => {
  const resUpdates = await getAuthenticatedThrow<
    z.infer<typeof ARUpdatesStatusSchema>
    >(`/api/settings/updates`, ARUpdatesStatusSchema);
  if (resUpdates.body.data.force_login) {
    clearUserInfo();
    return;
  }
  if (resUpdates.status === 200 && resUpdates.body.data.banned) {
    localStorage.setItem('BANNED', 'true');
    localStorage.setItem('BAN_REASON', resUpdates.body.data.ban_reason || '');
  } else {
    localStorage.setItem('BANNED', 'false');
    localStorage.removeItem('BAN_REASON');
  }
}

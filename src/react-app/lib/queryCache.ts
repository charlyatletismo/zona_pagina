import z from 'zod';
import {
  ARUserMinSchema,
  ARTrainingTeamIndexSchema,
} from '@shared/apiRespTypes';
import { getAuthenticated, getAuthenticatedThrow } from '@/lib/apiCalls';


export const trainingTeamsData: {
  data: z.infer<typeof ARTrainingTeamIndexSchema>[],
  expire: number,
} = {
  data: [],
  expire: Date.now() - 1000,
};


export const updateTrainingTeamsData = async (updateVar: CallableFunction) => {
  if (trainingTeamsData.expire > Date.now()) {
    updateVar(trainingTeamsData.data);
    return;
  }
  const tTeamApiRes = await getAuthenticatedThrow<
    z.infer<typeof ARTrainingTeamIndexSchema>[]
    >('/api/trainingTeams', z.array(ARTrainingTeamIndexSchema));
  trainingTeamsData.data = tTeamApiRes.body.data;
  trainingTeamsData.expire = Date.now() + 1000 * 60 * 5;
  updateVar(trainingTeamsData.data);
};


export const managersData: {
  data: z.infer<typeof ARUserMinSchema>[],
  expire: number,
} = {
  data: [],
  expire: Date.now() - 1000,
};


export const updateManagersData = async (updateVar: CallableFunction) => {
  if (managersData.expire > Date.now()) {
    return;
  }
  const managersApiRes = await getAuthenticatedThrow<
    z.infer<typeof ARUserMinSchema>[]
    >('/api/users/managers', z.array(ARUserMinSchema));
  managersData.data = managersApiRes.body.data;
  managersData.expire = Date.now() + 1000 * 60 * 5;
  updateVar(managersData.data);
};


export const getManagersData = async () => {
  if (managersData.expire > Date.now()) {
    return managersData.data;
  }
  await updateManagersData(() => {});
  return managersData.data;
}

export const getNonOrgManagersData = async (partialId: string) => {
  console.log('getNonOrgManagersData called with partialId:', partialId);
  console.log('Current managersData:', managersData);
  const found = managersData.data.filter(manager => manager.id.includes(partialId));
  if (found.length > 0 && managersData.expire > Date.now()) {
    return found;
  }
  const res = await getAuthenticated<
    z.infer<typeof ARUserMinSchema>[]
    >(`/api/settings/managers/search/${partialId}`,
      z.array(ARUserMinSchema));
  if (res.status !== 200) {
    return [];
  }
  managersData.data = res.body.data;
  managersData.expire = Date.now() + 1000 * 60 * 5;
  return res.body.data;
}

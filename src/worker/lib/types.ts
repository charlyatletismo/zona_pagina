export interface SportingEventFormData {
  id?: number;
  title: string;
  description?: string;
  image_url?: string;
  image_preview_url?: string;
  date: string;
  registration_start?: string;
  registration_end?: string;
  location_hint?: string;
  location_text?: string;
  location_lat?: number;
  location_long?: number;
  event_type: number;
  rules?: string;
  disclaimer_of_liability_title?: string;
  disclaimer_of_liability_content?: string;
  award_prizes?: string;
  created_by?: string;
  created_at?: string;
  last_update_by?: string;
  last_update_at?: string;
  circuits?: SportingEventCircuitFormData[];
  schedules?: SportingEventScheduleFormData[];
}

export interface SportingEventScheduleFormData {
  id?: number;
  event_id: number;
  date: string;
  title: string;
  description?: string;
  location_hint?: string;
  location_text?: string;
  location_lat?: number;
  location_long?: number;
}

export interface SportingEventCircuitFormData {
  id?: number;
  event_id: number;
  name: string;
  description?: string;
  distance_km: number;
  map_url?: string;
}

export interface SportingEventUpdateFormData {
  updateFields?: Partial<SportingEventFormData>;
  addCircuits?: SportingEventCircuitFormData[];
  updateCircuits?: SportingEventCircuitFormData[];
  deleteCircuitIds?: number[];
  addSchedules?: SportingEventScheduleFormData[];
  updateSchedules?: SportingEventScheduleFormData[];
  deleteScheduleIds?: number[];
}

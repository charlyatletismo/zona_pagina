export interface SportingEventFormData {
  id?: number;
  title: string;
  description?: string;
  image_url?: string;
  image_preview_url?: string;
  date: string;
  registration_start?: string;
  registration_end?: string;
  location?: string;
  location_address?: string;
  location_lat?: number;
  location_long?: number;
  event_type: string;
  rules?: string;
  disclaimer_of_liability?: string;
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
  location?: string;
  location_address?: string;
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

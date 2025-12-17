export type SportingEventType = {
  id: number;
  name: string;
  description: string;
}

export type SportingEvent = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  image_preview_url: string | null;
  date: string;
  inscription_start: string | null;
  inscription_end: string | null;
  location_hint: string | null;
  location_text: string | null;
  location_lat: number | null;
  location_long: number | null;
  circuit_map_url: string | null;
  event_type: SportingEventType["id"];
  rules: string | null;
  disclaimer_of_liability_title: string | null;
  disclaimer_of_liability_content: string | null;
  award_prizes: string | null;
  created_by: string;
  created_at: string;
  last_update_by: string;
  last_update_at: string;
}

export type SportingEventApiResponse = {
  open: SportingEvent[];
  comingSoon: SportingEvent[];
  closed: SportingEvent[];
  past: SportingEvent[];
}

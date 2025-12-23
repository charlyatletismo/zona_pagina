export interface User {
  id: string;
  phone: string;
  name: string;
  surname: string;
  sex: string;
  date_of_birth: string;
  country: string;
  city: string;
  full_location: string;
  manager_id: string;
  training_team: string;
  email: string;
  temp_code: string;
  roles: string;
  created_at: string;
  updated_at: string;
}

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
  registration_start: string | null;
  registration_end: string | null;
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
  created_by: User["id"];
  created_at: string;
  last_update_by: User["id"];
  last_update_at: string;
  user_registered?: boolean;
}

export interface SportingEventBasicInfo {
  id: SportingEvent["id"];
  title: SportingEvent["title"];
  description?: SportingEvent["description"];
  date: SportingEvent["date"];
  registration_start?: SportingEvent["registration_start"];
  registration_end?: SportingEvent["registration_end"];
  location_hint?: SportingEvent["location_hint"];
  location_text?: SportingEvent["location_text"];
}

export type SportingEventApiResponse = {
  open: SportingEventBasicInfo[];
  comingSoon: SportingEventBasicInfo[];
  closed: SportingEventBasicInfo[];
  past: SportingEventBasicInfo[];
}

export type SportingEventRegistration = {
  id: number;
  event_id: SportingEvent["id"];
  user_id: User["id"];
  registration_date: string;
  paid: boolean;
  payment_date: string | null;
}

export interface SportingEventRegistrationApiResponse {
  [eventId: SportingEvent["id"]]: {
    metadata: SportingEventBasicInfo;
    registrations: {
      registrationId: SportingEventRegistration["id"];
      userId: SportingEventRegistration["user_id"];
      userName: User["name"];
      userEmail: User["email"];
      userPhone: User["phone"];
      registrationDate: SportingEventRegistration["registration_date"];
      paid: SportingEventRegistration["paid"];
      paymentDate: SportingEventRegistration["payment_date"];
    }[];
  };
};

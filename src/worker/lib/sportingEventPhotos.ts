import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import {
  sportingEvents,
  // sportingEventGallery,
} from '../db/schema'
import { M } from './messages';
import { DataResult, NoDataResult } from './utils';


export const getSpEventGallery = async (
  db: DrizzleD1Database,
  eventId: number
): Promise<DataResult> => {
  const event = await db
    .select({
      id: sportingEvents.id,
      title: sportingEvents.title,
      photo_id: sportingEvents.photo_id,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  // const gallery_photos = await db
  //   .select({
  //     id: sportingEventGallery.id,
  //     order_n: sportingEventGallery.order_n,
  //     created_by: sportingEventGallery.created_by,
  //     created_at: sportingEventGallery.created_at,
  //   })
  //   .from(sportingEventGallery)
  //   .where(eq(sportingEventGallery.event_id, eventId))
  //   .orderBy(asc(sportingEventGallery.order_n));
  return {
    status: 200,
    data: {
      ...event,
      gallery_photos: [], // gallery_photos.length > 0 ? gallery_photos : null,
    },
  };
}

export const updateSpEventPhoto = async (
  db: DrizzleD1Database,
  eventId: number,
  formData: FormData,
  userId: string,
  CLOUDFLARE_ACCOUNT_ID: string,
  CLOUDFLARE_IMAGES_API_TOKEN: string,
): Promise<NoDataResult> => {
  const event = await db
    .select({
      id: sportingEvents.id,
      title: sportingEvents.title,
      photo_id: sportingEvents.photo_id,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  if (event.photo_id) {
    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${event.photo_id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
        },
      }
    );
    if (!delRes.ok) {
      console.error("Error deleting old image from Cloudflare:", await delRes.text());
      // we will not return an error here, because we don't want to block the update if the delete fails, but we will log the error and continue
    } else {
      console.log("Old image deleted from Cloudflare successfully");
    }
  }
  // change filename
  const file = formData.get('file') as File;
  const extension = file.name.split('.').pop();
  const newFilename = `zonaatletismo_spevent_${eventId}.${extension}`;
  formData.set('file', file, newFilename);
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
      body: formData,
    }
  );
  if (!res.ok) {
    console.error("Error uploading image to Cloudflare:", await res.text());
    return {
      status: 500,
      message: M.SPORTING_EVENT_PHOTO_UPDATE_ERROR
    };
  }
  const data: {
    success: boolean;
    result: {
      id: string;
      variants: string[];
    }
  } = await res.json();

  if (!data.success) {
    console.error("Cloudflare API returned success: false", data);
    return {
      status: 500,
      message: M.SPORTING_EVENT_PHOTO_UPDATE_ERROR
    };
  }

  await db.update(sportingEvents)
    .set({
      photo_id: data.result.id,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .where(eq(sportingEvents.id, eventId))
    .run();

  return {
    status: 200,
    message: M.SPORTING_EVENT_PHOTO_UPDATED_SUCCESSFULLY
  };
}

export const deleteSpEventPhoto = async (
  db: DrizzleD1Database,
  eventId: number,
  userId: string,
  CLOUDFLARE_ACCOUNT_ID: string,
  CLOUDFLARE_IMAGES_API_TOKEN: string,
): Promise<NoDataResult> => {
  const event = await db
    .select({
      id: sportingEvents.id,
      title: sportingEvents.title,
      photo_id: sportingEvents.photo_id,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  if (!event.photo_id) {
    return {
      status: 400,
      message: M.SPORTING_EVENT_PHOTO_NOT_FOUND
    };
  }
  const delRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${event.photo_id}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
    }
  );
  if (!delRes.ok) {
    console.error("Error deleting image from Cloudflare:", await delRes.text());
    return {
      status: 500,
      message: M.SPORTING_EVENT_PHOTO_DELETE_ERROR
    };
  }
  await db.update(sportingEvents)
    .set({
      photo_id: null,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .where(eq(sportingEvents.id, eventId))
    .run();

  return {
    status: 200,
    message: M.SPORTING_EVENT_PHOTO_DELETED_SUCCESSFULLY
  };
}

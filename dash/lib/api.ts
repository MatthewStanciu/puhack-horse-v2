import { ConfigData } from "../types/types";
import { delay, server } from "./helpers";

const url = `${server}/api/dash`;

export async function add(
  route: string,
  destination: string,
  newData: ConfigData
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`,
    },
    body: JSON.stringify({
      items: [
        {
          operation: "create",
          key: route,
          value: {
            d: destination,
            v: 0,
          },
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(err);
  });

  newData[route].status = "SUCCESS";
  await waitForPropagation(route);
  return newData;
}

export async function del(route: string, newData: ConfigData) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`,
    },
    body: JSON.stringify({
      items: [
        {
          operation: "delete",
          key: route,
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  await waitForPropagation(route, false);
  return newData;
}

export async function updateRoute(
  oldRoute: string,
  newRoute: string,
  destination: string,
  visits: number,
  newData: ConfigData
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`,
    },
    body: JSON.stringify({
      items: [
        {
          operation: "delete",
          key: oldRoute,
        },
        {
          operation: "create",
          key: newRoute,
          value: {
            d: destination,
            v: visits,
          },
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  newData[newRoute].status = "SUCCESS";
  await waitForPropagation(newRoute);
  return newData;
}

export async function updateDestination(
  route: string,
  newDestination: string,
  visits: number,
  newData: ConfigData
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`,
    },
    body: JSON.stringify({
      items: [
        {
          operation: "update",
          key: route,
          value: {
            d: newDestination,
            v: visits,
          },
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(err);
  });

  newData[route].status = "SUCCESS";
  return newData;
}

async function waitForPropagation(route: string, add = true) {
  // Writes to Edge Config can take a few seconds to propagate.
  // This waits for the new route to appear in a `getAll()` call
  // before returning data. If we didn't do this, the Optimistic UI
  // would update, but the row would then disappear when it revalidated.
  await delay(1000);
  let all: ConfigData = await fetch(url).then((r) => r.json());
  while (add ? !all.hasOwnProperty(route) : all.hasOwnProperty(route)) {
    await delay(1000);
    all = await fetch(url).then((r) => r.json());
  }
}

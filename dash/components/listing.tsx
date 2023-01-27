"use client";

import { CheckSquare, Edit, XSquare } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { delAndPut, put } from "../lib/api";
import { deleteObject, mutateObject, truncate } from "../lib/helpers";
import { KVData } from "../types/types";
import Erase from "./erase";

const Listing = ({
  route,
  destination,
  fallback,
}: {
  route: string;
  destination: string;
  fallback: KVData[];
}) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
    fetcher,
    {
      fallbackData: fallback,
    }
  );

  const [edit, setEdit] = useState(false);
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);

  return edit ? (
    <div className="grid grid-cols-2 gap-2 items-center border-t-2 border-black first:border-t-0 rounded-sm p-2 break-all group bg-gray-200">
      <div className="flex flex-row justify-center">
        <input
          onChange={(e) => setNewRoute(e.target.value)}
          className="text-sm border-2 p-1 outline-none border-gray-500 rounded font-mono w-7/12 bg-white text-center"
          value={newRoute}
          autoFocus
        ></input>
      </div>
      <div className="flex flex-row gap-1 items-center">
        <textarea
          onChange={(e) => setNewDest(e.target.value)}
          className="text-sm border-2 p-1 outline-none border-gray-500 rounded font-mono w-full bg-white resize-none"
          value={newDest}
          autoFocus
        ></textarea>
        <button
          className="p-1 invisible group-hover:visible"
          onClick={async () => {
            setEdit(false);
            if (newRoute === route && newDest === destination) return;
            let newData;
            if (route !== newRoute) {
              const filteredData = deleteObject(route, data);
              newData = filteredData
                .concat({ key: newRoute, value: newDest })
                .sort((a, b) => a.key.localeCompare(b.key));
            } else {
              newData = mutateObject("value", data, newRoute, newDest);
            }
            try {
              await mutate(
                route !== newRoute
                  ? delAndPut(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${route}`,
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${newRoute}`,
                      newDest,
                      newData
                    )
                  : put(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${newRoute}`,
                      newDest,
                      newData
                    ),
                {
                  optimisticData: [...newData],
                  rollbackOnError: true,
                  revalidate: false,
                  populateCache: true,
                }
              );
            } catch (err) {
              setNewRoute(route);
              setNewDest(destination);
              setEdit(false);
            }
          }}
        >
          <CheckSquare size="26px" color="#22c55e" />
        </button>
        <button
          className="p-1 invisible group-hover:visible"
          onClick={() => setEdit(false)}
        >
          <XSquare size="26px" color="#ef4444" />
        </button>
      </div>
    </div>
  ) : (
    <div className="route-list-item grid grid-cols-2 gap-2 items-center border-t-2 first:bg-green-500 last:bg-green-500 border-black p-2 break-all group hover:bg-gray-200">
      <p
        className="text-base text-center cursor-pointer"
        onClick={() => {
          setEdit(true);
          setNewRoute(route);
          setNewDest(destination);
        }}
      >
        {route}
      </p>
      <div className="flex flex-row gap-1 items-center">
        <p
          className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
          }}
        >
          {truncate(newDest, 32)}
        </p>
        <button
          className="text-xs p-1 invisible group-hover:visible"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
          }}
        >
          <Edit size="22px" />
        </button>
        <Erase fallback={fallback} route={route} />
      </div>
    </div>
  );
};

export default Listing;

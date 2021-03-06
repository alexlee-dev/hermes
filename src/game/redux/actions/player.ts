import { MapCoordinate, PlayerActionTypes, Station } from "../../../types";

export const handleSetPlayerDestination = (
  destination: Station | null
): PlayerActionTypes => ({
  type: "SET_PLAYER_DESTINATION",
  payload: { destination },
});

export const handleSetPlayerEta = (eta: number | null): PlayerActionTypes => ({
  type: "SET_PLAYER_ETA",
  payload: { eta },
});

export const handleSetPlayerIsTraveling = (
  isTraveling: boolean
): PlayerActionTypes => ({
  type: "SET_PLAYER_IS_TRAVELING",
  payload: { isTraveling },
});

export const handleSetPlayerLocation = (
  location: MapCoordinate
): PlayerActionTypes => ({
  type: "SET_PLAYER_LOCATION",
  payload: { location },
});

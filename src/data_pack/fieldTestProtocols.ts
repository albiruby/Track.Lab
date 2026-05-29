import { getAdaptedFieldTestProtocols, TrackLabFieldTestProtocol } from "./jsonAdapters";

export type FieldTestProtocol = TrackLabFieldTestProtocol;

export const fieldTestProtocols = getAdaptedFieldTestProtocols();

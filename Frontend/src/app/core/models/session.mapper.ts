import { Session } from './session.model';
import { User } from './user.model';

export function mapBackendSession(raw: any): Session {
  return {
    id: raw.id,

    title: raw.title ?? raw.titulo,
    subject: raw.subject ?? raw.tema,
    description: raw.description ?? raw.descripcion,

    status: raw.status ?? raw.estado,

    creatorId: raw.creatorId ?? raw.creadorId,
    creator: raw.creator
      ? {
          id: raw.creator.id,
          name: raw.creator.name ?? raw.creator.nombre,
          email: raw.creator.email
        }
      : raw.creador
      ? {
          id: raw.creador.id,
          name: raw.creador.name ?? raw.creador.nombre,
          email: raw.creador.email
        }
      : undefined,

    participants: Array.isArray(raw.participants)
      ? raw.participants.map((u: any): User => ({
          id: u.id,
          name: u.name ?? u.nombre,
          email: u.email
        }))
      : [],

    maxParticipants: raw.maxParticipants ?? raw.maxParticipantes ?? 5,

    duration: raw.duration ?? raw.duracion,
    isPrivate: raw.isPrivate ?? false
  };
}

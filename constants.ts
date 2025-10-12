// constants.ts
import { UserRole, UserRoleInfo } from './types';

interface HierarchicalRole {
  id: string;
  label: string;
  subRoles: { id: UserRole; label:string }[];
}

export const HIERARCHICAL_ROLES: HierarchicalRole[] = [
  {
    id: 'creator',
    label: 'The Creator',
    subRoles: [
      { id: 'musician', label: 'The Musician' },
      { id: 'technician', label: 'The Technician' },
      { id: 'performer', label: 'The Performer' },
      { id: 'visual_artist', label: 'The Visual Artist' },
    ],
  },
  {
    id: 'organizer',
    label: 'The Organizer',
    subRoles: [
      { id: 'venue_owner', label: 'The Venue Owner' },
      { id: 'event_planner', label: 'The Event Planner' },
      { id: 'talent_hunter', label: 'The Talent Hunter' },
    ],
  },
  {
    id: 'explorer',
    label: 'The Explorer',
    subRoles: [],
  },
];

export const ALL_ROLES: UserRoleInfo[] = HIERARCHICAL_ROLES.flatMap(role =>
  role.subRoles.length > 0 ? role.subRoles : [{ id: role.id as UserRole, label: role.label }]
);

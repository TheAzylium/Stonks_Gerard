import { rolesMap } from './rolesManager';

export let PosteList: { label: string; value: string }[] = [];

export function generatePosteList() {
  PosteList = [
    {
      label: 'En formation',
      value: rolesMap.get('formation'),
    },
    {
      label: 'Junior',
      value: rolesMap.get('junior'),
    },
    {
      label: 'Confirmé',
      value: rolesMap.get('confirmee'),
    },
    {
      label: 'Senior',
      value: rolesMap.get('senior'),
    },
    {
      label: "Chef d'équipe",
      value: rolesMap.get('chef_dequipe'),
    },
    {
      label: 'Administrateur',
      value: rolesMap.get('administrateur'),
    },
    {
      label: 'Head Security',
      value: rolesMap.get('head_security'),
    },
  ];
}

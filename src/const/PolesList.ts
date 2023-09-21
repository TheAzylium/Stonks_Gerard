import { rolesMap } from './rolesManager';

export let PoleList: { label: string; value: string }[] = [];

export function generatePoleList() {
  PoleList = [
    {
      label: 'Opérationnel',
      value: '1',
    },
    {
      label: 'RH',
      value: rolesMap.get('rh') || '',
    },
    {
      label: 'Formateur',
      value: rolesMap.get('formateur') || '',
    },
    {
      label: 'Commercial',
      value: rolesMap.get('commercial') || '',
    },
  ];
}

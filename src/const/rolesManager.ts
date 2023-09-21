import slugify from 'slugify';

export const rolesMap = new Map<string, string>();

export function formatRoleName(roleName: string): string {
  return slugify(roleName, {
    lower: true,
    replacement: '_',
    remove: /[*+~.()'"!:@]/g,
  });
}

import slugify from 'slugify';

export const channelMap = new Map<string, string>();

export function formatChannelName(roleName: string): string {
  return slugify(roleName, {
    lower: true,
    replacement: '_',
    remove: /[*+~.()'"!:@]/g,
  });
}

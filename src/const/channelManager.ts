import slugify from 'slugify';

export const channelMap = new Map<string, string>();

export function formatChannelName(roleName: string): string {
  const noEmoji = roleName.replace(
    /(?:\p{Emoji})(?!\p{Emoji_Modifier})|(\p{Emoji}\p{Emoji_Modifier}?)/gu,
    '',
  );
  return slugify(noEmoji, {
    lower: true,
    replacement: '_',
    remove: /[*+~.()'"!:@・]/g,
  });
}

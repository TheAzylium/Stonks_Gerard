import { readdirSync } from 'fs';
import { Client } from 'discord.js';
import { join } from 'path';

module.exports = async (client: Client) => {
  const componentDirs = join(__dirname, '../components');

  const componentFolders = readdirSync(componentDirs);
  for (const dir of componentFolders) {
    const folder = readdirSync(`${componentDirs}\\${dir}`);
    for (const subFolder of folder) {
      const componentFiles = readdirSync(
        `${componentDirs}\\${dir}\\${subFolder}`,
      ).filter(file => file.endsWith('.js'));

      const { buttons, modals, selectMenus } = client;

      switch (dir) {
        case 'buttons':
          for (const file of componentFiles) {
            const button = require(
              `${componentDirs}\\${dir}\\${subFolder}\\${file}`,
            ).default;
            buttons.set(button.data.name, button);
          }
          break;
        case 'modals':
          for (const file of componentFiles) {
            const modal = require(
              `${componentDirs}\\${dir}\\${subFolder}\\${file}`,
            ).default;
            modals.set(modal.data.name, modal);
          }
          break;
        case 'selectMenus':
          for (const file of componentFiles) {
            const selectMenu = require(
              `${componentDirs}\\${dir}\\${subFolder}\\${file}`,
            ).default;
            selectMenus.set(selectMenu.data.name, selectMenu);
          }
          break;
        default:
          break;
      }
    }
  }
};

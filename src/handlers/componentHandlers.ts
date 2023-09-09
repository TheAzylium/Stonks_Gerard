import { readdirSync } from 'fs';
import { Client } from 'discord.js';
import { join } from 'path';

module.exports = async (client: Client) => {
  const componentDirs = join(__dirname, '../components');

  const componentFolders = readdirSync(componentDirs);
  for (const folder of componentFolders) {
    const componentFiles = readdirSync(`${componentDirs}\\${folder}`).filter(
      (file) => file.endsWith('.js'),
    );

    const { buttons, modals, selectMenus } = client;

    switch (folder) {
      case 'buttons':
        for (const file of componentFiles) {
          const button = require(
            `${componentDirs}\\${folder}\\${file}`,
          ).default;
          buttons.set(button.data.name, button);
        }
        break;
      case 'modals':
        for (const file of componentFiles) {
          const modal = require(`${componentDirs}\\${folder}\\${file}`).default;
          modals.set(modal.data.name, modal);
        }
        break;
      case 'selectMenus':
        for (const file of componentFiles) {
          const selectMenu = require(
            `${componentDirs}\\${folder}\\${file}`,
          ).default;
          selectMenus.set(selectMenu.data.name, selectMenu);
        }
        break;
      default:
        break;
    }
  }

  // readdirSync(componentDirs).forEach(folder => {
  //   console.log(`Loading ${folder}...`)
  //   readdirSync(`${componentDirs}\\${folder}`).forEach(componentFiles => {
  //     console.log(`Loading ${componentFiles}...`)
  //     if (!componentFiles.endsWith('.js')) return;
  //
  //     const { buttons} = client
  //
  //     switch (folder) {
  //       case 'buttons':
  //         for (const file of componentFiles) {
  //           const button = require(`${componentDirs}\\${folder}\\${file}`).default;
  //           buttons.set(button.customId, button)
  //
  //         }
  //         break
  //       default:
  //         break;
  //     }
  //   })
  // })
};

import fs from 'fs/promises';
import path from 'path';

const sourceDir = path.join(process.cwd(), 'dist', 'data', 'gplates');
const targetDir = path.join(process.cwd(), 'public', 'data', 'gplates');

async function copyGplatesData() {
  try {
    // Créer le dossier de destination s'il n'existe pas
    await fs.mkdir(targetDir, { recursive: true });

    // Copier le fichier parsed_data.json
    await fs.copyFile(
      path.join(sourceDir, 'parsed_data.json'),
      path.join(targetDir, 'parsed_data.json')
    );

    console.log('✅ Données GPlates copiées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la copie des données GPlates:', error);
    process.exit(1);
  }
}

copyGplatesData(); 
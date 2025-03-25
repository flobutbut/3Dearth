import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GplatesFeature {
  type: string;
  properties: {
    name?: string;
    type?: string;
    age?: number;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

class GplatesAnalyzer {
  private readonly baseUrl = 'https://gws.gplates.org/webservice/reconstruct_features/';
  private readonly outputDir = path.join(__dirname, '../data/gplates');

  constructor() {
    // Créer le dossier de sortie s'il n'existe pas
    this.initializeOutputDir();
  }

  private async initializeOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async analyzePlateBoundaries(time: number): Promise<void> {
    try {
      console.log(`Analyse des frontières des plaques à ${time} Ma...`);
      
      // Récupérer les données des frontières des plaques
      const response = await axios.get(this.baseUrl, {
        params: {
          time: time,
          model: 'SETON2012',
          feature_type: 'plate_boundaries',
          return_type: 'geojson'
        }
      });

      const features = response.data.features as GplatesFeature[];
      
      // Analyser les types de frontières
      const boundaryTypes = new Map<string, number>();
      features.forEach(feature => {
        const type = feature.properties.type || 'unknown';
        boundaryTypes.set(type, (boundaryTypes.get(type) || 0) + 1);
      });

      // Sauvegarder les résultats
      const analysis = {
        time,
        totalBoundaries: features.length,
        boundaryTypes: Object.fromEntries(boundaryTypes),
        sampleFeatures: features.slice(0, 3) // Garder quelques exemples
      };

      await fs.writeFile(
        path.join(this.outputDir, `boundaries_${time}Ma.json`),
        JSON.stringify(analysis, null, 2)
      );

      console.log('Analyse terminée !');
      console.log('Types de frontières trouvés :', boundaryTypes);
    } catch (error) {
      console.error('Erreur lors de l\'analyse :', error);
    }
  }

  async analyzePlateVelocities(time: number): Promise<void> {
    try {
      console.log(`Analyse des vitesses des plaques à ${time} Ma...`);
      
      // Récupérer les données de vitesse
      const response = await axios.get(this.baseUrl, {
        params: {
          time: time,
          model: 'SETON2012',
          feature_type: 'plate_velocities',
          return_type: 'geojson'
        }
      });

      const features = response.data.features as GplatesFeature[];
      
      // Analyser les vitesses
      const velocities = features.map(feature => ({
        plateId: feature.properties.name,
        velocity: feature.properties.velocity,
        direction: feature.properties.direction
      }));

      // Sauvegarder les résultats
      const analysis = {
        time,
        totalPlates: features.length,
        velocities: velocities,
        sampleFeatures: features.slice(0, 3)
      };

      await fs.writeFile(
        path.join(this.outputDir, `velocities_${time}Ma.json`),
        JSON.stringify(analysis, null, 2)
      );

      console.log('Analyse terminée !');
      console.log(`Nombre de plaques analysées : ${features.length}`);
    } catch (error) {
      console.error('Erreur lors de l\'analyse :', error);
    }
  }

  async analyzeRotations(time: number): Promise<void> {
    try {
      console.log(`Analyse des rotations des plaques à ${time} Ma...`);
      
      const response = await axios.get(this.baseUrl, {
        params: {
          time: time,
          model: 'SETON2012',
          feature_type: 'plate_rotations',
          return_type: 'geojson'
        }
      });

      const features = response.data.features as GplatesFeature[];
      
      // Analyser les rotations
      const rotations = features.map(feature => ({
        plateId: feature.properties.name,
        rotation: feature.properties.rotation,
        euler_pole: feature.properties.euler_pole
      }));

      // Sauvegarder les résultats
      const analysis = {
        time,
        totalPlates: features.length,
        rotations: rotations,
        sampleFeatures: features.slice(0, 3)
      };

      await fs.writeFile(
        path.join(this.outputDir, `rotations_${time}Ma.json`),
        JSON.stringify(analysis, null, 2)
      );

      console.log('Analyse terminée !');
      console.log(`Nombre de plaques analysées : ${features.length}`);
    } catch (error) {
      console.error('Erreur lors de l\'analyse :', error);
    }
  }
}

// Fonction principale
async function main() {
  const analyzer = new GplatesAnalyzer();
  
  // Analyser plusieurs époques
  const times = [-250, -200, -150, -100, -50, 0];
  
  for (const time of times) {
    await analyzer.analyzePlateBoundaries(time);
    await analyzer.analyzePlateVelocities(time);
    await analyzer.analyzeRotations(time);
  }
}

async function analyzeData() {
  try {
    const dataPath = path.join(__dirname, '../dist/data/gplates/parsed_data.json')
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    
    console.log('Structure des données:')
    console.log('---------------------')
    console.log('Type de données:', typeof data)
    console.log('Est un objet:', typeof data === 'object')
    console.log('Clés disponibles:', Object.keys(data))
    
    if (Array.isArray(data)) {
      console.log('\nPremier élément:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('\nPremière clé:')
      const firstKey = Object.keys(data)[0]
      console.log('Clé:', firstKey)
      console.log('Valeur:', JSON.stringify(data[firstKey], null, 2))
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse des données:', error)
  }
}

main().catch(console.error);
analyzeData(); 
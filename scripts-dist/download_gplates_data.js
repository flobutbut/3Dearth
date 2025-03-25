import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { gunzip } from 'zlib';
import { parseStringPromise } from 'xml2js';
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gunzipAsync = promisify(gunzip);
class GplatesDownloader {
    constructor() {
        this.outputDir = path.join(__dirname, '../public/data/gplates');
        this.datasets = [
            {
                name: 'Zahirovic2022',
                description: 'Rotations from Zahirovic et al. 2022',
                type: 'rotation',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/Rotations/Zahirovic_etal_2022_OptimisedMantleRef_and_NNRMantleRef.rot',
                targetPath: path.join(this.outputDir, 'rotations/Zahirovic_etal_2022_OptimisedMantleRef_and_NNRMantleRef.rot')
            },
            {
                name: 'Coastlines',
                description: 'Present day coastlines',
                type: 'gpmlz',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/Coastlines/Global_EarthByte_GPlates_PresentDay_Coastlines.gpmlz',
                targetPath: path.join(this.outputDir, 'coastlines/Global_EarthByte_GPlates_PresentDay_Coastlines.gpmlz')
            },
            {
                name: 'ContinentalPolygons',
                description: 'Present day continental polygons',
                type: 'gpmlz',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/ContinentalPolygons/Global_EarthByte_GPlates_PresentDay_ContinentalPolygons.gpmlz',
                targetPath: path.join(this.outputDir, 'continents/Global_EarthByte_GPlates_PresentDay_ContinentalPolygons.gpmlz')
            },
            {
                name: 'FractureZones',
                description: 'Fracture zones',
                type: 'gpmlz',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/SeafloorFabric/FZ_cookiecut.gpmlz',
                targetPath: path.join(this.outputDir, 'seafloor/FZ_cookiecut.gpmlz')
            },
            {
                name: 'ExtinctRidges',
                description: 'Extinct ridges',
                type: 'gpmlz',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/SeafloorFabric/ExtinctRidges_cookiecut.gpmlz',
                targetPath: path.join(this.outputDir, 'seafloor/ExtinctRidges_cookiecut.gpmlz')
            },
            {
                name: 'DeformationZones',
                description: 'Deformation zones',
                type: 'gpmlz',
                sourcePath: '/Applications/GPlates_2.5.0/GeoData/FeatureCollections/SeafloorFabric/DZ_cookiecut.gpmlz',
                targetPath: path.join(this.outputDir, 'seafloor/DZ_cookiecut.gpmlz')
            }
        ];
    }
    async init() {
        try {
            // Création des sous-dossiers
            const subdirs = ['rotations', 'coastlines', 'continents', 'seafloor'];
            for (const subdir of subdirs) {
                await fs.mkdir(path.join(this.outputDir, subdir), { recursive: true });
            }
        }
        catch (error) {
            console.error('Erreur lors de la création des dossiers:', error);
        }
    }
    async copyFiles() {
        let allFilesExist = true;
        for (const dataset of this.datasets) {
            try {
                // Vérifier si le fichier source existe
                await fs.access(dataset.sourcePath);
                console.log(`✅ Fichier source trouvé pour ${dataset.name}`);
                // Créer le dossier de destination si nécessaire
                await fs.mkdir(path.dirname(dataset.targetPath), { recursive: true });
                // Copier le fichier
                await fs.copyFile(dataset.sourcePath, dataset.targetPath);
                // Vérifier que le fichier a bien été copié
                const stats = await fs.stat(dataset.targetPath);
                if (stats.size > 0) {
                    console.log(`✅ ${dataset.name} copié avec succès (${stats.size} octets)`);
                }
                else {
                    throw new Error('Le fichier copié est vide');
                }
            }
            catch (error) {
                console.error(`❌ Erreur lors de la copie de ${dataset.name}:`, error);
                allFilesExist = false;
            }
        }
        return allFilesExist;
    }
    async parseRotationFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const rotations = [];
            const plateRotations = {};
            for (const line of lines) {
                if (line.trim() && !line.startsWith('!')) {
                    // Format: plateId time lat lon angle referencePlateId [comment]
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 6) {
                        const plateId = parseInt(parts[0]);
                        const time = parseFloat(parts[1]);
                        const lat = parseFloat(parts[2]);
                        const lon = parseFloat(parts[3]);
                        const angle = parseFloat(parts[4]);
                        const referencePlateId = parseInt(parts[5]);
                        const comment = parts.slice(6).join(' ');
                        const rotation = {
                            time,
                            lat,
                            lon,
                            angle,
                            plateId1: plateId,
                            plateId2: referencePlateId,
                            comment
                        };
                        // Organiser les rotations par plaque
                        if (!plateRotations[plateId]) {
                            plateRotations[plateId] = [];
                        }
                        plateRotations[plateId].push(rotation);
                        rotations.push(rotation);
                    }
                }
            }
            // Trier les rotations par temps pour chaque plaque
            for (const plateId in plateRotations) {
                plateRotations[plateId].sort((a, b) => a.time - b.time);
            }
            return {
                rotations,
                plateRotations,
                metadata: {
                    totalRotations: rotations.length,
                    uniquePlates: Object.keys(plateRotations).length,
                    timeRange: {
                        min: Math.min(...rotations.map(r => r.time)),
                        max: Math.max(...rotations.map(r => r.time))
                    }
                }
            };
        }
        catch (error) {
            console.error(`Erreur lors du parsing du fichier de rotation:`, error);
            throw error;
        }
    }
    async parseGpmlzFile(filePath) {
        try {
            console.log(`Lecture du fichier GPMLZ ${filePath}...`);
            const compressedData = await fs.readFile(filePath);
            console.log('Décompression des données...');
            const xmlBuffer = await gunzipAsync(compressedData);
            const xmlString = xmlBuffer.toString('utf-8');
            console.log('Parsing du XML...');
            const xmlData = await parseStringPromise(xmlString);
            const features = xmlData['gpml:FeatureCollection']?.['gml:featureMember'] || [];
            console.log(`Nombre de features trouvées: ${features.length}`);
            const geometries = [];
            const types = new Set();
            const plateIds = new Set();
            for (const featureMember of features) {
                // Récupérer le premier type de feature (Basin, ClosedContinentalBoundary, etc.)
                const featureType = Object.keys(featureMember)[0];
                const feature = featureMember[featureType][0];
                types.add(featureType);
                // Extraire les attributs
                const shapefileAttributes = feature['gpml:shapefileAttributes']?.[0]?.['gpml:KeyValueDictionary']?.[0]?.['gpml:element'] || [];
                const plateId = parseInt(shapefileAttributes.find((e) => e['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:key']?.[0] === 'PLATEID1')?.['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:value']?.[0] || '0');
                const conjugatePlateId = parseInt(shapefileAttributes.find((e) => e['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:key']?.[0] === 'PLATEID2')?.['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:value']?.[0] || '0');
                const name = shapefileAttributes.find((e) => e['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:key']?.[0] === 'NAME')?.['gpml:KeyValueDictionaryElement']?.[0]?.['gpml:value']?.[0] || featureType;
                if (plateId)
                    plateIds.add(plateId);
                if (conjugatePlateId)
                    plateIds.add(conjugatePlateId);
                // Chercher les géométries dans différents chemins possibles
                const possibleGeometryPaths = [
                    {
                        path: feature['gpml:outlineOf']?.[0]?.['gpml:ConstantValue']?.[0]?.['gpml:value']?.[0]?.['gml:Polygon']?.[0],
                        type: 'polygon'
                    },
                    {
                        path: feature['gpml:geometry']?.[0]?.['gml:Polygon']?.[0],
                        type: 'polygon'
                    },
                    {
                        path: feature['gpml:centerLineOf']?.[0]?.['gml:LineString']?.[0],
                        type: 'linestring'
                    },
                    {
                        path: feature['gpml:boundary']?.[0]?.['gml:LineString']?.[0],
                        type: 'linestring'
                    },
                    {
                        path: feature['gpml:unclassifiedGeometry']?.[0]?.['gpml:ConstantValue']?.[0]?.['gpml:value']?.[0]?.['gml:OrientableCurve']?.[0]?.['gml:baseCurve']?.[0]?.['gml:LineString']?.[0],
                        type: 'linestring'
                    }
                ];
                for (const { path, type } of possibleGeometryPaths) {
                    if (!path)
                        continue;
                    let coordinates = [];
                    if (type === 'polygon') {
                        // Pour les polygones, on extrait les coordonnées du LinearRing
                        const linearRing = path['gml:exterior']?.[0]?.['gml:LinearRing']?.[0]?.['gml:posList']?.[0]?.['_'] ||
                            path['gml:LinearRing']?.[0]?.['gml:posList']?.[0]?.['_'];
                        if (linearRing) {
                            const coords = linearRing.split(/\s+/).map(Number);
                            for (let i = 0; i < coords.length; i += 2) {
                                if (!isNaN(coords[i]) && !isNaN(coords[i + 1]) && coords[i] !== 0) {
                                    coordinates.push([coords[i], coords[i + 1]]);
                                }
                            }
                        }
                    }
                    else {
                        // Pour les LineStrings, on extrait directement les coordonnées
                        const posList = path['gml:posList']?.[0]?.['_'];
                        if (posList) {
                            const coords = posList.split(/\s+/).map(Number);
                            for (let i = 0; i < coords.length; i += 2) {
                                if (!isNaN(coords[i]) && !isNaN(coords[i + 1]) && coords[i] !== 0) {
                                    coordinates.push([coords[i], coords[i + 1]]);
                                }
                            }
                        }
                    }
                    if (coordinates.length > 0) {
                        geometries.push({
                            type,
                            coordinates,
                            plateId,
                            conjugatePlateId,
                            name
                        });
                    }
                }
            }
            return {
                metadata: {
                    count: geometries.length,
                    types: Array.from(types),
                    plateIds: Array.from(plateIds)
                },
                polygons: geometries
            };
        }
        catch (error) {
            console.error(`Erreur lors du parsing du fichier GPMLZ:`, error);
            throw error;
        }
    }
    async parseAllFiles() {
        const results = {};
        for (const dataset of this.datasets) {
            try {
                if (dataset.type === 'rotation') {
                    const rotations = await this.parseRotationFile(dataset.targetPath);
                    results[dataset.name] = rotations;
                    console.log(`Fichier de rotation ${dataset.name} parsé avec succès !`);
                }
                else if (dataset.type === 'gpmlz') {
                    try {
                        const data = await this.parseGpmlzFile(dataset.targetPath);
                        results[dataset.name] = data;
                        console.log(`Fichier GPMLZ ${dataset.name} traité avec succès !`);
                    }
                    catch (error) {
                        console.error(`Erreur lors du parsing du fichier GPMLZ ${dataset.name}:`, error);
                        // En cas d'erreur, on stocke quand même les informations sur le fichier
                        results[dataset.name] = {
                            error: error.message || String(error),
                            path: dataset.targetPath,
                            size: (await fs.stat(dataset.targetPath)).size,
                            timestamp: new Date().toISOString()
                        };
                    }
                }
            }
            catch (error) {
                console.error(`Erreur lors du parsing du fichier ${dataset.name}:`, error);
                results[dataset.name] = {
                    error: error.message || String(error),
                    path: dataset.targetPath
                };
            }
        }
        // Sauvegarde des résultats
        const outputFile = path.join(this.outputDir, 'parsed_data.json');
        try {
            await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
            console.log(`Données parsées sauvegardées dans ${outputFile}`);
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des données parsées:', error);
        }
    }
}
async function main() {
    const downloader = new GplatesDownloader();
    await downloader.init();
    console.log('Copie des fichiers depuis GPlates...\n');
    const filesCopied = await downloader.copyFiles();
    if (!filesCopied) {
        console.log('\n⚠️  Certains fichiers n\'ont pas pu être copiés !');
        console.log('Veuillez vérifier que GPlates est installé et que les fichiers sont présents.');
        process.exit(1);
    }
    console.log('\n✅ Tous les fichiers sont copiés, début du parsing...\n');
    await downloader.parseAllFiles();
}
main().catch(console.error);

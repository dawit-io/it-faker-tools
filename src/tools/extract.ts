import { WikiDataExtractor } from './wikidata-extractor.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
    const extractor = new WikiDataExtractor();
    try {
        console.log('Fetching data from Wikidata...');
        const people = await extractor.getItalianPeople(100); // Inizia con 100 per testare
        
        console.log('\nEsempio di persone trovate:');
        people.slice(0, 5).forEach(person => {
            console.log(`${person.name} ${person.surname} - ${person.birthPlace.city}`);
        });

        const uniqueSurnames = new Set(people.map(p => p.surname));
        console.log(`\nTrovati ${uniqueSurnames.size} cognomi unici`);

        // Salva i risultati in un file JSON
        const outputPath = path.join(process.cwd(), 'data', 'output', 'people.json');
        await fs.writeFile(outputPath, JSON.stringify(people, null, 2), 'utf-8');
        console.log(`\nDati salvati in: ${outputPath}`);

    } catch (error) {
        console.error('Errore:', error);
    }
}

main();
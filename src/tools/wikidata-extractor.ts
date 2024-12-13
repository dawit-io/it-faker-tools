import axios from 'axios';

// Configura l'agente proxy

interface WikiPerson {
  name: string;
  surname: string;
  birthPlace: {
    city: string;
    province: string;
    region: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  birthDate?: string;
  occupation?: string[];
}

interface WikiDataResponse {
  head: { vars: string[] };
  results: {
    bindings: Array<{
      person: { value: string };
      name: { value: string };
      birthPlace: { value: string };
      birthPlaceLabel: { value: string };
      coordinates?: { value: string };
      occupation?: { value: string };
      occupationLabel?: { value: string };
    }>;
  };
}

export class WikiDataExtractor {
  private readonly endpoint = 'https://query.wikidata.org/sparql';
  
  
  private async queryWikiData(query: string): Promise<WikiDataResponse> {
    try {
        const instance = axios.create({
            baseURL: this.endpoint
          });
          
      const response = await instance.get(this.endpoint, {
        params: {
          query,
          format: 'json'
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WikiDataNameExtractor/1.0 (https://github.com/yourusername/it-faker-tools)'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Query error details:', error.response.data);
      }
      throw new Error(`Failed to query WikiData: ${error}`);
    }
  }

  public async getItalianPeople(limit: number = 1000): Promise<WikiPerson[]> {
    // Query semplificata per test
    const query = `
      SELECT DISTINCT ?person ?name ?birthPlace ?birthPlaceLabel 
      WHERE {
        ?person wdt:P27 wd:Q38 .  # cittadinanza italiana
        ?person rdfs:label ?name . # nome completo
        ?person wdt:P19 ?birthPlace . # luogo di nascita
        
        SERVICE wikibase:label { 
          bd:serviceParam wikibase:language "it" .
          ?birthPlace rdfs:label ?birthPlaceLabel .
        }
        
        FILTER(LANG(?name) = "it")
      }
      LIMIT ${limit}
    `;

    console.log('Executing query:', query); // Debug

    const response = await this.queryWikiData(query);
    return this.processResults(response);
  }

  private processResults(response: WikiDataResponse): WikiPerson[] {
    return response.results.bindings.map(binding => {
      const fullName = binding.name.value;
      // In Wikidata, i nomi italiani sono spesso nel formato "Cognome, Nome"
      const [surname, ...namesParts] = fullName.split(',').map(part => part.trim());
      const firstName = namesParts.join(' ').trim();

      return {
        name: firstName || 'Unknown',
        surname: surname || 'Unknown',
        birthPlace: {
          city: binding.birthPlaceLabel?.value || 'Unknown',
          province: '',  // Per ora lo lasciamo vuoto
          region: ''    // Per ora lo lasciamo vuoto
        }
      };
    });
  }
}
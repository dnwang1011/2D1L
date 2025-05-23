import weaviate from 'weaviate-ts-client';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple interface for Weaviate class objects since WeaviateClass is not exported
interface WeaviateClassConfig {
  class: string;
  description?: string;
  properties?: any[];
  vectorizer?: string;
  moduleConfig?: any;
}

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const weaviateScheme = process.env.WEAVIATE_SCHEME || 'http';
const weaviateHost = process.env.WEAVIATE_HOST || 'localhost:8080'; // From docker-compose

const client = weaviate.client({
  scheme: weaviateScheme,
  host: weaviateHost,
});

const schemaFilePath = path.resolve(__dirname, '../../docs/weaviate_schema.json');

async function applyWeaviateSchema() {
  console.log(`Connecting to Weaviate at ${weaviateScheme}://${weaviateHost}...`);

  try {
    const health = await client.misc.liveChecker().do();
    if (!health) {
      console.error('Weaviate is not live. Please ensure Weaviate is running.');
      process.exit(1);
    }
    console.log('Successfully connected to Weaviate.');

    const schemaConfig = await fs.readJson(schemaFilePath);
    if (!schemaConfig || !schemaConfig.classes) {
      console.error('Invalid schema file format. Expected a `classes` array.');
      process.exit(1);
    }

    console.log('Fetching existing schema from Weaviate...');
    const existingSchema = await client.schema.getter().do();
    const existingClassNames = existingSchema.classes?.map(c => c.class) || [];
    console.log('Existing classes:', existingClassNames);

    for (const classObj of schemaConfig.classes as WeaviateClassConfig[]) {
      console.log(`\nProcessing class: ${classObj.class}`);
      if (existingClassNames.includes(classObj.class)) {
        console.log(`Class "${classObj.class}" already exists in Weaviate. Skipping creation.`);
        // TODO: Implement schema migration/update logic if needed in the future.
        // For now, we only create if it doesn't exist.
      } else {
        console.log(`Class "${classObj.class}" does not exist. Attempting to create...`);
        try {
          await client.schema.classCreator().withClass(classObj).do();
          console.log(`Successfully created class "${classObj.class}".`);
        } catch (e: any) {
          console.error(`Error creating class "${classObj.class}":`, e.message || e);
          if (e.stack) console.error(e.stack);
        }
      }
    }

    console.log('\nWeaviate schema setup process complete.');
  } catch (err: any) {
    console.error('An error occurred during Weaviate schema setup:', err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

applyWeaviateSchema(); 
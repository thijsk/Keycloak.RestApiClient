const {readFile, writeFile} = require('fs').promises;

const inputFile = process.argv[2];
const outputFile = process.argv[3];
replace().then(() => console.log('Finished.'));

async function replace() {
    
    let openApiDefinitionJson = await readFile(inputFile, 'utf8');
    const openApiDefinition = JSON.parse(openApiDefinitionJson);
    
	// Fix 'ClientPolicyConditionRepresentation' and 'ClientPolicyExecutorRepresentation'
	openApiDefinition.components.schemas.ClientPolicyConditionRepresentation.properties.configuration.type = 'string';
	openApiDefinition.components.schemas.ClientPolicyExecutorRepresentation.properties.configuration.type = 'string';
	
	// Remove deprecated members producing name conflicts
	delete openApiDefinition.components.schemas.AccessToken.properties.authTime
	delete openApiDefinition.components.schemas.IDToken.properties.authTime
	
	delete openApiDefinition['paths']['/admin/realms']['post']['requestBody']['content']['application/json']['schema']['format'];
	delete openApiDefinition['paths']['/admin/realms']['post']['requestBody']['content']['application/json']['schema']['type'];
	openApiDefinition['paths']['/admin/realms']['post']['requestBody']['content']['application/json']['schema']['$ref'] = '#/components/schemas/RealmRepresentation'

    openApiDefinitionJson = JSON.stringify(openApiDefinition, null, '  ');
	
	// Replace generic parameter <T> with C# friendly {T}.
	openApiDefinitionJson = openApiDefinitionJson.replace(/("?description"?\s*:\s*)(.*)<(.*)>(.*)/, '$1$2{$3}$4');
	
    await writeFile(outputFile, openApiDefinitionJson, 'utf8');
}
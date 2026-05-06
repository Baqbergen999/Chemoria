const https = require('https');

function fetchSDF(name, type) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/record/SDF/?record_type=${type}`;
  https.get(url, (res) => {
    console.log(name, type, res.statusCode);
  });
}

const reqs = ["Glucose", "Sucrose", "Cyclohexane", "Benzene", "Chlorobenzene", "Phenol", "Benzaldehyde", "Aniline", "Azobenzene", "Biphenyl", "Naphthalene", "Pyridine", "Imidazole", "Pyrimidine", "Ascorbic Acid"];

reqs.forEach(r => fetchSDF(r, '3d'));

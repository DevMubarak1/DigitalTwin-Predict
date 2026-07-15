const fs = require('fs');
try {
  const buf = fs.readFileSync('dashboard/public/kiln.glb');
  const jsonLength = buf.readUInt32LE(12);
  const json = buf.toString('utf8', 20, 20 + jsonLength);
  const parsed = JSON.parse(json);
  
  const blobs = [];
  if (parsed.images) {
    parsed.images.forEach(img => {
      if (img.uri && img.uri.includes('blob:')) {
        blobs.push(img.uri);
      }
    });
  }
  console.log('Blobs found:', blobs);
  
  if (blobs.length > 0) {
    console.log('Replacing blob URLs with empty data URIs to prevent crash...');
    let fixedJson = json;
    // Replace blob URLs with a 1x1 transparent pixel or empty string if it fails
    // A simple transparent 1x1 png base64
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    blobs.forEach(b => {
      fixedJson = fixedJson.replace(b, dummyImage);
    });
    
    // We must pad the JSON string to be exactly the same length in bytes!
    // Since dummyImage is longer or shorter, we pad with spaces.
    const newJsonBuffer = Buffer.from(fixedJson, 'utf8');
    if (newJsonBuffer.length > jsonLength) {
      console.error('Cannot replace safely: new JSON is larger than old JSON.');
    } else {
      const paddedBuffer = Buffer.alloc(jsonLength, 0x20); // fill with spaces
      newJsonBuffer.copy(paddedBuffer);
      paddedBuffer.copy(buf, 20); // overwrite in original buffer
      fs.writeFileSync('dashboard/public/kiln.glb', buf);
      console.log('GLB patched successfully.');
    }
  } else {
    console.log('No blob URLs found in kiln.glb.');
  }
} catch (e) {
  console.error(e);
}

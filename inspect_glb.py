import json
import sys

def analyze_glb(filepath):
    with open(filepath, 'rb') as f:
        # Read header
        magic = f.read(4)
        version = int.from_bytes(f.read(4), 'little')
        length = int.from_bytes(f.read(4), 'little')
        
        # Read JSON chunk
        chunk_length = int.from_bytes(f.read(4), 'little')
        chunk_type = f.read(4)
        json_data = f.read(chunk_length).decode('utf-8')
        
        d = json.loads(json_data)
        
        meshes = d.get('meshes', [])
        for i, m in enumerate(meshes):
            name = m.get('name', f'Mesh_{i}')
            extras = m.get('extras', {})
            targetNames = extras.get('targetNames')
            if m.get('weights'):
                print(f"Mesh: {name}")
                if targetNames:
                    print(f"  Target Names ({len(targetNames)}):")
                    for t in targetNames:
                        print(f"    - {t}")
                else:
                    print("  Has morph weights but no targetNames in extras.")
                    if 'primitives' in m:
                        for p in m['primitives']:
                            if 'targets' in p:
                                print(f"  Has {len(p['targets'])} targets in primitives.")
                            
analyze_glb("Frontend/public/models/hr.glb")

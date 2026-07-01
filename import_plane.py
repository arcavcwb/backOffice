import re
import requests
import json

API_KEY = "plane_api_af971fdc54404723aed105c6ad14f07a"
WORKSPACE = "capsula"
PROJECT_ID = "6308445e-8b0b-4eee-bf27-07c14b2a6331"
STATE_ID = "fee2f4c7-927a-4d1a-9524-ca62487bc214" # Backlog

url = f"https://api.plane.so/api/v1/workspaces/{WORKSPACE}/projects/{PROJECT_ID}/issues/"
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

with open("PRD.md", "r", encoding="utf-8") as f:
    content = f.read()

# Find all HUs
# They start with "### HU-" and end before the next "### HU-" or "---"
hus = re.split(r'\n### (?=HU-\d+)', '\n' + content)
hus = hus[1:] # discard everything before the first HU

for hu in hus:
    lines = hu.strip().split('\n')
    title_line = lines[0] # e.g. "HU-001 (Épica: EP-01)"
    
    # parse fields
    historia = ""
    prioridad = "none"
    estimacion = None
    criterios = []
    notas = ""
    dependencias = ""
    
    current_section = None
    for line in lines[1:]:
        if line.startswith('- **Historia:**'):
            historia = line.replace('- **Historia:**', '').strip()
        elif line.startswith('- **Prioridad:**'):
            p_str = line.replace('- **Prioridad:**', '').strip().lower()
            if 'alta' in p_str: prioridad = 'high'
            elif 'media' in p_str: prioridad = 'medium'
            elif 'baja' in p_str: prioridad = 'low'
        elif line.startswith('- **Estimación:**'):
            try:
                estimacion = int(line.replace('- **Estimación:**', '').strip())
            except:
                pass
        elif line.startswith('- **Criterios de aceptación:**'):
            current_section = 'criterios'
        elif line.startswith('- **Notas técnicas:**'):
            notas = line.replace('- **Notas técnicas:**', '').strip()
            current_section = None
        elif line.startswith('- **Dependencias:**'):
            dependencias = line.replace('- **Dependencias:**', '').strip()
            current_section = None
        else:
            if current_section == 'criterios' and line.strip().startswith('-'):
                criterios.append(line.strip())
            elif current_section == 'criterios' and line.strip() == '':
                continue
            elif line.startswith('---'):
                break
                
    name = f"{title_line.strip()} - {historia}"[:250] # plane limit might be 255
    description_html = f"<p><strong>Historia:</strong> {historia}</p>"
    if estimacion:
        description_html += f"<p><strong>Estimación:</strong> {estimacion} puntos</p>"
    if criterios:
        description_html += "<p><strong>Criterios de aceptación:</strong></p><ul>"
        for c in criterios:
            c_text = c.replace('- [ ]', '').strip()
            description_html += f"<li>{c_text}</li>"
        description_html += "</ul>"
    if notas:
        description_html += f"<p><strong>Notas técnicas:</strong> {notas}</p>"
    if dependencias:
        description_html += f"<p><strong>Dependencias:</strong> {dependencias}</p>"
        
    payload = {
        "name": name,
        "description_html": description_html,
        "state_id": STATE_ID,
        "priority": prioridad
    }
    
    print(f"Creating {title_line.strip()}...")
    resp = requests.post(url, headers=headers, json=payload)
    if resp.status_code in (200, 201):
        print("Success")
    else:
        print(f"Failed: {resp.text}")


import os
from pathlib import Path
import requests

# 1. Токен из переменной окружения или .env
SONAR_TOKEN = os.getenv('SONAR_TOKEN')
if not SONAR_TOKEN:
    env_file = Path(__file__).resolve().parent / '.env'
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8-sig') as f:
            for line in f:
                if line.startswith('SONAR_TOKEN='):
                    SONAR_TOKEN = line.strip().split('=', 1)[1].strip(' "\'')
                    break

# 2. Ключ твоего проекта
PROJECT_KEY = os.getenv('SONAR_PROJECT_KEY', 'Kovname_proj') 

url = "https://sonarcloud.io/api/issues/search"
params = {
    "componentKeys": PROJECT_KEY,
    "statuses": "OPEN,CONFIRMED",
    "ps": 500,
    "p": 1
}

response = requests.get(url, params=params, auth=(SONAR_TOKEN, ''))

if response.status_code == 200:
    issues = response.json().get('issues', [])
    
    # Сохраняем в формат .md (Markdown)
    with open('sonar_tasks_for_agent.md', 'w', encoding='utf-8') as f:
        f.write("# 🛠 Список задач на исправление (SonarCloud)\n\n")
        f.write("Отмечай `[x]` по мере исправления:\n\n")
        
        for issue in issues:
            file_path = issue.get('component', '').replace(f'{PROJECT_KEY}:', '')
            line = issue.get('line', 'N/A')
            message = issue.get('message', '')
            rule = issue.get('rule', '')
            type_issue = issue.get('type', 'ISSUE')
            
            # Формируем элемент чек-листа
            f.write(f"- [ ] **[{type_issue}]** `{file_path}` (Строка: {line})\n")
            f.write(f"  - **Правило:** `{rule}`\n")
            f.write(f"  - **Описание:** {message}\n\n")
            
    print(f"Готово! Сохранено {len(issues)} задач в файл sonar_tasks_for_agent.md")
else:
    print(f"Ошибка доступа: {response.status_code} - {response.text}")
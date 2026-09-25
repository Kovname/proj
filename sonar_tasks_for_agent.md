# 🛠 Список задач на исправление (SonarCloud)

Отмечай `[x]` по мере исправления:

- [x] **[CODE_SMELL]** `backend/main.py` (Строка: 200)
  - **Правило:** `python:S3776`
  - **Описание:** Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed.

- [x] **[CODE_SMELL]** `backend/main.py` (Строка: 298)
  - **Правило:** `python:S8572`
  - **Описание:** Use "logging.exception()" instead.

- [x] **[CODE_SMELL]** `backend/main.py` (Строка: 299)
  - **Правило:** `python:S8415`
  - **Описание:** Document this HTTPException with status code 502 in the "responses" parameter.

- [x] **[CODE_SMELL]** `backend/main.py` (Строка: 338)
  - **Правило:** `python:S8572`
  - **Описание:** Use "logging.exception()" instead.

- [x] **[CODE_SMELL]** `backend/main.py` (Строка: 339)
  - **Правило:** `python:S8415`
  - **Описание:** Document this HTTPException with status code 502 in the "responses" parameter.

- [x] **[CODE_SMELL]** `frontend/app.jsx` (Строка: 124)
  - **Правило:** `javascript:S3358`
  - **Описание:** Extract this nested ternary operation into an independent statement.

- [x] **[CODE_SMELL]** `frontend/app.jsx` (Строка: 139)
  - **Правило:** `javascript:S3358`
  - **Описание:** Extract this nested ternary operation into an independent statement.

- [x] **[VULNERABILITY]** `frontend/index.html` (Строка: 17)
  - **Правило:** `Web:S5725`
  - **Описание:** Add integrity and crossorigin="anonymous" attributes to this element to enforce integrity checks.

- [x] **[VULNERABILITY]** `frontend/index.html` (Строка: 18)
  - **Правило:** `Web:S5725`
  - **Описание:** Add integrity and crossorigin="anonymous" attributes to this element to enforce integrity checks.

- [x] **[CODE_SMELL]** `frontend/styles.css` (Строка: 584)
  - **Правило:** `css:S4666`
  - **Описание:** Duplicate selector "tbody tr", first used at line 342

- [x] **[VULNERABILITY]** `solar.py` (Строка: 4)
  - **Правило:** `secrets:S6702`
  - **Описание:** Make sure this SonarQube token gets revoked, changed, and removed from the code.


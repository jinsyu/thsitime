# 이번 생은

지구의 동물 중 하나로 무작위로 태어나 그 일생을 살아보는 웹 시뮬레이션.

- `index.html` — 화면과 스타일
- `app.js` — 추첨, 일생 엔진, 생명 기록
- `art.js` — 종별 일러스트와 서식지 배경
- `data/<id>.js` — 종별 삶의 궤적 데이터 (형식: `data/SCHEMA.md`)
- 데이터 검사: `node data/validate.js data/<id>.js`

빌드 없이 정적 파일로 동작한다. 기록은 브라우저 localStorage에만 저장된다.

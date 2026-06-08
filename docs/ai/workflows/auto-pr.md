# Auto-PR 에이전트 워크플로우 — FE

당신은 FANDROPS FE의 **Auto-PR 에이전트**입니다. 사용자가 기능을 요청하면 아래 워크플로를 **순서대로** 실행합니다.

> **금지:** `.github/ISSUE_TEMPLATE/feature.md` · `pull_request_template.md` 를 **채우지 않고** `gh --body-file`로 올리지 마세요.

**반드시 먼저 읽기:** `@docs/ai/SHARED.md` · `@docs/ai/personas/frontend.md`
- 이슈: `.github/ISSUE_TEMPLATE/feature.md` (Bug → `bug.md`)
- PR: `.github/pull_request_template.md`
- 본문 골격(frontmatter 없음): `docs/ai/workflows/templates/issue-feature-body.md` · `pr-body.md`

---

## [Auto-PR 워크플로우]

### 1. Plan
Small PR(~200줄) 단위로 쪼갠다. `fe-checklist.md` 해당 항목 사전 확인.

### 2. 이슈 본문 작성
`docs/ai/workflows/templates/issue-feature-body.md` 섹션 구조에 맞춰 내용을 채운 뒤  
`docs/ai/workflows/generated/issue-<번호>-body.md` 에 저장한다.

- 섹션: 📝 작업 내용 · Definition of Done · 📅 마감 기한 · Related
- 제목 형식: `Feat/fe: <한 줄 요약>`

### 3. Issue 생성

```bash
gh issue create --title "Feat/fe: <요약>" --label feature --body-file docs/ai/workflows/generated/issue-<N>-body.md
```

- `--body-file` 인자는 **채운 generated 파일**만 사용. 템플릿 원본 직접 사용 금지.
- 생성된 **이슈 번호** 기록.

### 4. 브랜치

```bash
git checkout develop && git pull && git checkout -b feat/<이슈번호>
```

### 5. 구현·검증
SHARED + frontend 페르소나 준수. `npx tsc --noEmit` 오류 0건 확인.

### 6. 커밋

```bash
git commit -m "feat: <요약> (#<이슈번호>)"
```

### 7. PR 본문 작성
`docs/ai/workflows/templates/pr-body.md` 구조에 맞춰  
`docs/ai/workflows/generated/pr-<N>-body.md` 저장.

- 섹션: 📝 작업 내용 · 🧪 기술적 의사결정 · 📌 주요 변경사항 · 🔗 연관 이슈(`Closes #n`) · ✅ 셀프 체크리스트
- **임의 섹션 추가 금지** (PR 템플릿과 불일치)

### 8. PR 생성

```bash
git push -u origin HEAD
gh pr create --base develop --title "feat: <요약>" --body-file docs/ai/workflows/generated/pr-<N>-body.md
```

### 9. 하네스 회고

PR 생성 완료 후 아래 형식으로 출력:

```
[Retro] 룰 작동: <1줄> | 튜닝 제안: <1줄> | SSOT 동기화 필요: <있음/없음> | Edge Case: <있음(내용)/없음>
```

전체 리포트 → `docs/ai/workflows/generated/retro-<PR번호>.md` 저장.

---

## 체크 (리뷰 전)

| 항목 | 확인 |
| --- | --- |
| 이슈 라벨 | `feature` (Bug는 `bug`) |
| 브랜치 | `feat/<번호>` / `fix/<번호>` |
| PR base | `develop` |
| tsc | `npx tsc --noEmit` 오류 0건 |
| build | `npm run build` 성공 |
| sandbox | 샌드박스 모드 정상 동작 확인 |
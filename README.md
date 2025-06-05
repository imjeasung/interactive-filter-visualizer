# 🎛️ Interactive Filter Visualizer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge)](https://imjeasung.github.io/interactive-filter-visualizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-brightgreen?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**다양한 필터의 동작을 실시간으로 시각화하고 비교할 수 있는 인터랙티브 웹 애플리케이션**

![image](https://github.com/user-attachments/assets/8a7905d7-7961-4ec1-8fa2-a4fe8e3acae1)


## ✨ 주요 기능

### 🎵 신호 생성
- **4가지 신호 타입**: 사인파, 사각파, 삼각파, 가우시안 노이즈
- **실시간 파라미터 조정**: 주파수, 진폭, 노이즈 레벨
- **재생 속도 제어**: 0.1x ~ 3x 속도 조정

### 🔧 필터 종류
1. **이동평균 필터 (Moving Average)**
   - 윈도우 크기 조정 (3~50)
   - 노이즈 제거에 효과적

2. **로우패스 필터 (Low-pass)**
   - 1차 RC 필터 (IIR 구현)
   - 컷오프 주파수 조정 (1~25Hz)
   - 고주파 성분 제거

3. **하이패스 필터 (High-pass)**
   - 1차 RC 필터 (IIR 구현)
   - 컷오프 주파수 조정 (0.5~10Hz)
   - 저주파/DC 성분 제거

4. **칼만 필터 (Kalman Filter)**
   - 1차원 상태 추정
   - 프로세스/측정 노이즈 조정

### 📊 실시간 분석
- **노이즈 제거 효과** 측정
- **신호 부드러움** 평가
- **RMS 값** 비교
- **실시간 통계** 정보

## 🚀 빠른 시작

### 온라인 데모
👉 **[GitHub Pages에서 바로 체험하기](https://imjeasung.github.io/interactive-filter-visualizer)**

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/imjeasung/interactive-filter-visualizer.git

# 폴더 이동
cd interactive-filter-visualizer

# index.html 클릭
```

## 📁 프로젝트 구조

```
interactive-filter-visualizer/
├── index.html              # 메인 HTML 파일
├── css/                    # 스타일시트 (선택사항)
├── js/
│   ├── main-app.js         # 메인 애플리케이션 로직
│   ├── filters/            # 필터 구현
│   │   ├── moving-average-filter.js
│   │   ├── lowpass.js
│   │   ├── highpass.js
│   │   └── kalman.js
│   ├── signal/             # 신호 생성
│   │   └── signal-generator.js
│   └── ui/                 # UI 컴포넌트
│       └── canvas-visualizer.js
└── README.md
```

## 🎮 사용 방법

### 1. 신호 설정
1. **신호 타입** 선택 (사인파, 사각파, 삼각파, 노이즈)
2. **주파수**와 **진폭** 조정
3. **노이즈 레벨** 설정

### 2. 필터 선택
- 상단 탭에서 원하는 필터 선택
- 각 필터별 파라미터 조정

### 3. 실시간 분석
- ▶️ **시작** 버튼으로 시뮬레이션 시작
- 원본 신호와 필터링된 신호 비교
- 실시간 통계 정보 확인

## 🔬 교육적 활용

### 신호처리 학습
- 필터의 **주파수 응답** 특성 이해
- **노이즈 제거** 원리 학습
- **실시간 처리**의 효과 체험

### 실험 예시
1. **노이즈가 있는 사인파**에 이동평균 필터 적용
2. **고주파 성분** 제거를 위한 로우패스 필터 사용
3. **DC 성분** 제거를 위한 하이패스 필터 활용
4. **불안정한 신호**에 칼만 필터 적용

## 🛠️ 기술 스택

### 프론트엔드
- **HTML5 Canvas** - 실시간 그래프 렌더링
- **Vanilla JavaScript (ES6+)** - 모든 로직 구현
- **CSS3** - 모던 UI 디자인

### 핵심 알고리즘
- **이동평균**: 링 버퍼 기반 효율적 구현
- **RC 필터**: 1차 아날로그 RC 회로의 디지털 구현
- **칼만 필터**: 1차원 상태공간 모델

## 📈 성능 최적화

- **RequestAnimationFrame** 기반 부드러운 애니메이션
- **링 버퍼** 활용한 메모리 효율성
- **실시간 렌더링** 최적화

## 🔧 커스터마이징

### 새로운 필터 추가
```javascript
class CustomFilter {
    constructor(param1, param2) {
        // 필터 초기화
    }
    
    filter(input) {
        // 필터링 로직
        return output;
    }
    
    reset() {
        // 상태 리셋
    }
}
```

### 신호 타입 확장
```javascript
generateCustomSignal(frequency, amplitude) {
    // 커스텀 신호 생성 로직
    return signalValue;
}
```

## 🤝 기여하기

프로젝트 개선에 참여해주세요!

1. Fork 후 브랜치 생성
2. 기능 개발 또는 버그 수정
3. 테스트 완료 후 Pull Request

### 개발 가이드라인
- ES6+ 문법 사용
- 명확한 함수/변수명
- JSDoc 주석 추가
- 모듈화된 구조 유지

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🏷️ 태그

`#signal-processing` `#filter-visualization` `#javascript` `#canvas` `#kalman-filter` `#education` `#real-time` `#web-app`

---

### 📞 문의사항

프로젝트 관련 문의나 제안사항이 있으시면 jeasunglim39@gmail.com 연락 바랍니다!

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**

// main-app.js - 메인 애플리케이션 로직

class FilterVisualizerApp {
    constructor() {
        // 초기화
        this.isPlaying = false;
        this.animationId = null;
        this.currentFilter = 'moving-average';
        
        // 컴포넌트 인스턴스
        this.signalGenerator = null;
        this.originalVisualizer = null;
        this.filteredVisualizer = null;
        this.filter = null;
        
        // 현재 설정값
        this.settings = {
            signalType: 'sine',
            frequency: 5,
            amplitude: 1,
            noiseLevel: 0.1,
            windowSize: 10
        };
        
        // 통계 데이터
        this.statistics = {
            originalRMS: 0,
            filteredRMS: 0,
            noiseReduction: 0
        };
        
        // 초기화 시작
        this.init();
    }

    /**
     * 애플리케이션 초기화
     */
    init() {
        console.log('🎛️ 필터 시각화 도구 초기화 중...');
        
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * 컴포넌트 설정 및 이벤트 리스너 등록
     */
    setup() {
        try {
            // 컴포넌트 인스턴스 생성
            this.createInstances();
            
            // UI 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 UI 상태 설정
            this.updateUI();
            
            console.log('✅ 초기화 완료!');
        } catch (error) {
            console.error('❌ 초기화 실패:', error);
        }
    }

    /**
     * 컴포넌트 인스턴스 생성
     */
    createInstances() {
        // 신호 생성기
        this.signalGenerator = new SignalGenerator();
        
        // 캔버스 시각화
        this.originalVisualizer = new CanvasVisualizer('original-canvas', {
            signalColor: '#2196F3',
            backgroundColor: '#fafafa'
        });
        
        this.filteredVisualizer = new CanvasVisualizer('filtered-canvas', {
            signalColor: '#4CAF50',
            backgroundColor: '#fafafa'
        });
        
        // 필터
        this.filter = new MovingAverageFilter(this.settings.windowSize);
        
        // 전역 참조 (리사이즈 이벤트용)
        window.originalVisualizer = this.originalVisualizer;
        window.filteredVisualizer = this.filteredVisualizer;
        
        console.log('📦 컴포넌트 인스턴스 생성 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 신호 생성 컨트롤
        this.getElementById('signal-type').addEventListener('change', (e) => {
            this.settings.signalType = e.target.value;
        });

        this.getElementById('frequency').addEventListener('input', (e) => {
            this.settings.frequency = parseFloat(e.target.value);
            this.updateValueDisplay('frequency-value', e.target.value);
        });

        this.getElementById('amplitude').addEventListener('input', (e) => {
            this.settings.amplitude = parseFloat(e.target.value);
            this.updateValueDisplay('amplitude-value', e.target.value);
        });

        this.getElementById('noise-level').addEventListener('input', (e) => {
            this.settings.noiseLevel = parseFloat(e.target.value);
            this.updateValueDisplay('noise-value', e.target.value);
        });

        // 필터 컨트롤
        this.getElementById('window-size').addEventListener('input', (e) => {
            this.settings.windowSize = parseInt(e.target.value);
            this.updateValueDisplay('window-value', e.target.value);
            if (this.filter) {
                this.filter.setWindowSize(this.settings.windowSize);
            }
        });

        // 재생/정지 버튼
        this.getElementById('play-pause').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 리셋 버튼
        this.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });

        // 필터 탭
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                this.switchFilter(filterType);
            });
        });

        console.log('🎮 이벤트 리스너 설정 완료');
    }

    /**
     * DOM 요소 가져오기 (에러 처리 포함)
     */
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element;
    }

    /**
     * 값 표시 업데이트
     */
    updateValueDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (elementId.includes('noise')) {
                element.textContent = parseFloat(value).toFixed(2);
            } else if (elementId.includes('amplitude')) {
                element.textContent = parseFloat(value).toFixed(1);
            } else {
                element.textContent = value;
            }
        }
    }

    /**
     * 재생/정지 토글
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * 시뮬레이션 시작
     */
    start() {
        this.isPlaying = true;
        this.getElementById('play-pause').innerHTML = '⏸️ 정지';
        this.animate();
        console.log('▶️ 시뮬레이션 시작');
    }

    /**
     * 시뮬레이션 정지
     */
    stop() {
        this.isPlaying = false;
        this.getElementById('play-pause').innerHTML = '▶️ 시작';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('⏸️ 시뮬레이션 정지');
    }

    /**
     * 리셋
     */
    reset() {
        this.stop();
        
        // 컴포넌트 리셋
        if (this.signalGenerator) {
            this.signalGenerator.reset();
        }
        if (this.filter) {
            this.filter.reset();
        }
        if (this.originalVisualizer) {
            this.originalVisualizer.clearData();
        }
        if (this.filteredVisualizer) {
            this.filteredVisualizer.clearData();
        }
        
        // 통계 리셋
        this.statistics = {
            originalRMS: 0,
            filteredRMS: 0,
            noiseReduction: 0
        };
        this.updateStatistics();
        
        console.log('🔄 리셋 완료');
    }

    /**
     * 메인 애니메이션 루프
     */
    animate() {
        if (!this.isPlaying) return;

        try {
            // 새로운 신호 생성
            const originalSignal = this.signalGenerator.generateSignal(
                this.settings.signalType,
                this.settings.frequency,
                this.settings.amplitude,
                this.settings.noiseLevel
            );

            // 필터 적용
            const filteredSignal = this.filter.filter(originalSignal);

            // 현재 시간
            const currentTime = this.signalGenerator.getCurrentTime();

            // 시각화 업데이트
            this.originalVisualizer.updateRealtime(originalSignal, currentTime);
            this.filteredVisualizer.updateRealtime(filteredSignal, currentTime);

            // 시간 진행
            this.signalGenerator.step();

            // 통계 업데이트 (매 10프레임마다)
            if (Math.floor(currentTime * 100) % 10 === 0) {
                this.updateStatistics();
            }

        } catch (error) {
            console.error('애니메이션 오류:', error);
            this.stop();
        }

        // 다음 프레임 요청
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 통계 정보 업데이트
     */
    updateStatistics() {
        try {
            const originalStats = this.originalVisualizer.getStatistics();
            const filteredStats = this.filteredVisualizer.getStatistics();

            this.statistics.originalRMS = originalStats.rms;
            this.statistics.filteredRMS = filteredStats.rms;
            
            // 노이즈 제거율 계산 (간단한 방법)
            if (originalStats.rms > 0) {
                const reduction = Math.max(0, 1 - (filteredStats.std / originalStats.std)) * 100;
                this.statistics.noiseReduction = isNaN(reduction) ? 0 : reduction;
            }

            // UI 업데이트
            this.updateStatisticsUI();
        } catch (error) {
            console.error('통계 계산 오류:', error);
        }
    }

    /**
     * 통계 UI 업데이트
     */
    updateStatisticsUI() {
        const elements = {
            'original-rms': this.statistics.originalRMS.toFixed(2),
            'filtered-rms': this.statistics.filteredRMS.toFixed(2),
            'noise-reduction': this.statistics.noiseReduction.toFixed(0) + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * 필터 전환 (향후 확장용)
     */
    switchFilter(filterType) {
        // 현재는 이동평균만 지원
        if (filterType !== 'moving-average') {
            alert('해당 필터는 아직 구현되지 않았습니다.');
            return;
        }

        // 탭 활성화 상태 변경
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

        this.currentFilter = filterType;
        console.log(`🔧 필터 전환: ${filterType}`);
    }

    /**
     * 초기 UI 상태 설정
     */
    updateUI() {
        // 슬라이더 값 표시 업데이트
        this.updateValueDisplay('frequency-value', this.settings.frequency);
        this.updateValueDisplay('amplitude-value', this.settings.amplitude);
        this.updateValueDisplay('noise-value', this.settings.noiseLevel);
        this.updateValueDisplay('window-value', this.settings.windowSize);
        
        // 통계 초기화
        this.updateStatisticsUI();
        
        console.log('🎨 UI 초기화 완료');
    }

    /**
     * 애플리케이션 종료
     */
    destroy() {
        this.stop();
        // 추가적인 정리 작업
        console.log('🗑️ 애플리케이션 종료');
    }
}

// 페이지 로드 시 애플리케이션 시작
let app;
if (typeof window !== 'undefined') {
    // 이전 스크립트들이 로드될 때까지 잠시 대기
    setTimeout(() => {
        try {
            app = new FilterVisualizerApp();
            window.filterApp = app; // 디버깅용 전역 참조
        } catch (error) {
            console.error('❌ 애플리케이션 시작 실패:', error);
            console.log('💡 필요한 라이브러리가 모두 로드되었는지 확인해주세요.');
        }
    }, 100);
}

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (app) {
            app.destroy();
        }
    });
}
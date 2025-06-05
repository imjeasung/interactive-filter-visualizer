// canvas-visualizer.js - 캔버스에 실시간 신호를 그리는 클래스

class CanvasVisualizer {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 기본 설정
        this.options = {
            backgroundColor: '#ffffff',
            gridColor: '#f0f0f0',
            axisColor: '#cccccc',
            signalColor: '#667eea',
            signalWidth: 2,
            gridLines: true,
            showAxis: true,
            autoScale: true,
            yMin: -2,
            yMax: 2,
            ...options
        };

        // 데이터 관리
        this.data = [];
        this.maxDataPoints = 400;
        this.timeWindow = 2; // 초 단위로 표시할 시간 윈도우
        
        // 캔버스 크기 설정
        this.setupCanvas();
        
        // 초기 그리기
        this.clear();
    }

    /**
     * 캔버스 크기 및 해상도 설정
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // 실제 픽셀 크기 설정 (고해상도 대응)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // CSS 크기는 그대로 유지
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // 스케일 조정
        this.ctx.scale(dpr, dpr);
        
        // 캔버스 크기 저장
        this.width = rect.width;
        this.height = rect.height;
    }

    /**
     * 캔버스 클리어 및 배경 그리기
     */
    clear() {
        // 배경 색칠
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 격자 그리기
        if (this.options.gridLines) {
            this.drawGrid();
        }
        
        // 축 그리기
        if (this.options.showAxis) {
            this.drawAxis();
        }
    }

    /**
     * 격자 그리기
     */
    drawGrid() {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 0.5;
        this.ctx.setLineDash([2, 2]);

        const gridSpacing = 40; // 격자 간격

        this.ctx.beginPath();
        
        // 세로 격자선
        for (let x = 0; x <= this.width; x += gridSpacing) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        
        // 가로 격자선
        for (let y = 0; y <= this.height; y += gridSpacing) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]); // 점선 해제
    }

    /**
     * 축 그리기 (X축, Y축)
     */
    drawAxis() {
        this.ctx.strokeStyle = this.options.axisColor;
        this.ctx.lineWidth = 1;

        const centerY = this.height / 2;

        this.ctx.beginPath();
        
        // X축 (중앙 가로선)
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.width, centerY);
        
        // Y축 (왼쪽 세로선)
        this.ctx.moveTo(40, 0);
        this.ctx.lineTo(40, this.height);
        
        this.ctx.stroke();

        // 축 레이블 그리기
        this.drawAxisLabels();
    }

    /**
     * 축 레이블 그리기
     */
    drawAxisLabels() {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';

        const centerY = this.height / 2;
        
        // Y축 레이블
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.options.yMax.toFixed(1), 35, 15);
        this.ctx.fillText('0', 35, centerY + 4);
        this.ctx.fillText(this.options.yMin.toFixed(1), 35, this.height - 5);
        
        // X축 레이블 (시간)
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Time (s)', this.width / 2, this.height - 5);
    }

    /**
     * 데이터 포인트 추가
     * @param {number} value - Y축 값
     * @param {number} time - X축 값 (시간)
     */
    addDataPoint(value, time) {
        this.data.push({ value, time });
        
        // 데이터 개수 제한
        if (this.data.length > this.maxDataPoints) {
            this.data.shift();
        }
        
        // 자동 스케일링
        if (this.options.autoScale && this.data.length > 10) {
            this.updateScale();
        }
    }

    /**
     * Y축 스케일 자동 조정
     */
    updateScale() {
        const values = this.data.map(d => d.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        // 여유 공간 추가 (20%)
        const range = max - min;
        const margin = range * 0.2;
        
        this.options.yMax = max + margin;
        this.options.yMin = min - margin;
        
        // 최소 범위 보장
        if (range < 0.1) {
            this.options.yMax = 1;
            this.options.yMin = -1;
        }
    }

    /**
     * 신호 그래프 그리기
     */
    drawSignal() {
        if (this.data.length < 2) return;

        this.ctx.strokeStyle = this.options.signalColor;
        this.ctx.lineWidth = this.options.signalWidth;
        this.ctx.setLineDash([]);

        this.ctx.beginPath();

        // 시간 범위 계산
        const latestTime = this.data[this.data.length - 1].time;
        const earliestTime = latestTime - this.timeWindow;

        let firstPoint = true;

        for (let i = 0; i < this.data.length; i++) {
            const point = this.data[i];
            
            // 시간 윈도우 내의 데이터만 그리기
            if (point.time < earliestTime) continue;

            const x = this.timeToX(point.time, earliestTime, latestTime);
            const y = this.valueToY(point.value);

            if (firstPoint) {
                this.ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    /**
     * 시간을 X 좌표로 변환
     */
    timeToX(time, earliestTime, latestTime) {
        const timeRange = latestTime - earliestTime;
        const normalizedTime = (time - earliestTime) / timeRange;
        return 50 + normalizedTime * (this.width - 60); // 여백 고려
    }

    /**
     * 값을 Y 좌표로 변환
     */
    valueToY(value) {
        const range = this.options.yMax - this.options.yMin;
        const normalizedValue = (value - this.options.yMin) / range;
        return this.height - (normalizedValue * this.height);
    }

    /**
     * 전체 그래프 업데이트 (클리어 + 그리기)
     */
    update() {
        this.clear();
        this.drawSignal();
    }

    /**
     * 실시간 업데이트 (새 데이터 추가 + 그리기)
     * @param {number} value - 새로운 신호 값
     * @param {number} time - 현재 시간
     */
    updateRealtime(value, time) {
        this.addDataPoint(value, time);
        this.update();
    }

    /**
     * 데이터 초기화
     */
    clearData() {
        this.data = [];
        this.clear();
    }

    /**
     * 신호 색상 변경
     * @param {string} color - 새로운 색상
     */
    setSignalColor(color) {
        this.options.signalColor = color;
    }

    /**
     * 시간 윈도우 설정
     * @param {number} seconds - 표시할 시간 범위 (초)
     */
    setTimeWindow(seconds) {
        this.timeWindow = seconds;
    }

    /**
     * Y축 범위 수동 설정
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     */
    setYRange(min, max) {
        this.options.yMin = min;
        this.options.yMax = max;
        this.options.autoScale = false;
    }

    /**
     * 자동 스케일링 활성화/비활성화
     * @param {boolean} enabled - 자동 스케일링 여부
     */
    setAutoScale(enabled) {
        this.options.autoScale = enabled;
    }

    /**
     * 캔버스 크기 조정 (반응형 대응)
     */
    resize() {
        this.setupCanvas();
        this.update();
    }

    /**
     * 현재 데이터의 통계 정보 반환
     * @returns {Object} 통계 정보 객체
     */
    getStatistics() {
        if (this.data.length === 0) {
            return { rms: 0, mean: 0, std: 0, min: 0, max: 0 };
        }

        const values = this.data.map(d => d.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        
        const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
        const std = Math.sqrt(variance);
        
        const sumOfSquares = values.reduce((a, b) => a + b * b, 0);
        const rms = Math.sqrt(sumOfSquares / values.length);
        
        const min = Math.min(...values);
        const max = Math.max(...values);

        return { rms, mean, std, min, max };
    }
}

// 브라우저 환경에서 전역으로 사용 가능하게 만들기
if (typeof window !== 'undefined') {
    window.CanvasVisualizer = CanvasVisualizer;
}

// 창 크기 변경 시 모든 캔버스 크기 조정
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        // 전역 캔버스 인스턴스들이 있다면 크기 조정
        if (window.originalVisualizer) {
            window.originalVisualizer.resize();
        }
        if (window.filteredVisualizer) {
            window.filteredVisualizer.resize();
        }
    });
}
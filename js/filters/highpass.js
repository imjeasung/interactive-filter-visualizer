// js/filters/highpass.js - 1차 IIR 하이패스 필터 구현

class HighpassFilter {
    constructor(cutoffFrequency = 5, sampleRate = 100) {
        this.cutoffFrequency = cutoffFrequency;
        this.sampleRate = sampleRate;
        this.previousInput = 0;
        this.previousOutput = 0;
        this.alpha = this.calculateAlpha();
        
        // 필터 상태 초기화
        this.isInitialized = false;
    }

    /**
     * 알파 계수 계산 (컷오프 주파수 기반)
     * α = RC / (RC + dt)
     * 여기서 RC = 1/(2πfc), dt = 1/fs
     */
    calculateAlpha() {
        const dt = 1 / this.sampleRate;
        const rc = 1 / (2 * Math.PI * this.cutoffFrequency);
        return rc / (rc + dt);
    }

    /**
     * 입력 신호를 필터링
     * y[n] = α * (x[n] - x[n-1]) + α * y[n-1]
     * 또는 y[n] = α * (y[n-1] + x[n] - x[n-1])
     */
    filter(input) {
        if (!this.isInitialized) {
            // 첫 번째 샘플은 0으로 출력 (차분이 없으므로)
            this.previousInput = input;
            this.previousOutput = 0;
            this.isInitialized = true;
            return 0;
        }

        // 1차 IIR 하이패스 필터 적용
        const output = this.alpha * (this.previousOutput + input - this.previousInput);
        
        this.previousInput = input;
        this.previousOutput = output;
        
        return output;
    }

    /**
     * 컷오프 주파수 설정
     */
    setCutoffFrequency(newCutoffFrequency) {
        if (newCutoffFrequency <= 0) {
            throw new Error('컷오프 주파수는 0보다 커야 합니다.');
        }
        
        if (newCutoffFrequency >= this.sampleRate / 2) {
            console.warn('컷오프 주파수가 나이퀴스트 주파수를 초과합니다.');
            newCutoffFrequency = this.sampleRate / 2 - 1;
        }
        
        this.cutoffFrequency = newCutoffFrequency;
        this.alpha = this.calculateAlpha();
    }

    /**
     * 샘플링 레이트 설정
     */
    setSampleRate(newSampleRate) {
        if (newSampleRate <= 0) {
            throw new Error('샘플링 레이트는 0보다 커야 합니다.');
        }
        
        this.sampleRate = newSampleRate;
        this.alpha = this.calculateAlpha();
    }

    /**
     * 필터 상태 리셋
     */
    reset() {
        this.previousInput = 0;
        this.previousOutput = 0;
        this.isInitialized = false;
    }

    /**
     * 현재 필터 설정 정보 반환
     */
    getInfo() {
        return {
            type: 'Highpass Filter (1st Order IIR)',
            cutoffFrequency: this.cutoffFrequency,
            sampleRate: this.sampleRate,
            alpha: this.alpha,
            timeConstant: 1 / (2 * Math.PI * this.cutoffFrequency)
        };
    }

    /**
     * 주파수 응답 계산 (선택적)
     * 주어진 주파수에서의 크기 응답을 계산
     */
    getFrequencyResponse(frequency) {
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        const magnitude = (1 - this.alpha) * Math.sin(omega / 2) / Math.sqrt(
            Math.pow(1 - this.alpha * Math.cos(omega), 2) + 
            Math.pow(this.alpha * Math.sin(omega), 2)
        );
        return Math.abs(magnitude);
    }

    /**
     * 3dB 컷오프 주파수에서의 감쇠 확인
     */
    getCutoffAttenuation() {
        return this.getFrequencyResponse(this.cutoffFrequency);
    }

    /**
     * 필터 지연 계산 (그룹 지연)
     */
    getGroupDelay() {
        // 1차 IIR 필터의 근사적 그룹 지연
        return this.alpha / ((1 - this.alpha) * this.sampleRate);
    }
}

// 모듈로 내보내기 (Node.js 환경에서 사용시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighpassFilter;
}
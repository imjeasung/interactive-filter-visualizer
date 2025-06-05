// signal-generator.js - 다양한 신호를 생성하는 클래스

class SignalGenerator {
    constructor() {
        this.sampleRate = 1000; // 샘플링 레이트 (Hz)
        this.time = 0;          // 현재 시간
        this.timeStep = 1 / this.sampleRate; // 시간 간격
    }

    /**
     * 사인파 생성
     * @param {number} frequency - 주파수 (Hz)
     * @param {number} amplitude - 진폭
     * @param {number} phase - 위상 (기본값: 0)
     * @returns {number} 사인파 값
     */
    generateSine(frequency, amplitude = 1, phase = 0) {
        return amplitude * Math.sin(2 * Math.PI * frequency * this.time + phase);
    }

    /**
     * 사각파 생성
     * @param {number} frequency - 주파수 (Hz)
     * @param {number} amplitude - 진폭
     * @returns {number} 사각파 값
     */
    generateSquare(frequency, amplitude = 1) {
        const sineValue = Math.sin(2 * Math.PI * frequency * this.time);
        return amplitude * (sineValue >= 0 ? 1 : -1);
    }

    /**
     * 삼각파 생성
     * @param {number} frequency - 주파수 (Hz)
     * @param {number} amplitude - 진폭
     * @returns {number} 삼각파 값
     */
    generateTriangle(frequency, amplitude = 1) {
        const period = 1 / frequency;
        const timeInPeriod = this.time % period;
        const normalizedTime = timeInPeriod / period; // 0~1 사이 값
        
        let triangleValue;
        if (normalizedTime < 0.5) {
            // 상승 구간: 0 -> 1
            triangleValue = 2 * normalizedTime;
        } else {
            // 하강 구간: 1 -> 0
            triangleValue = 2 * (1 - normalizedTime);
        }
        
        // -1 ~ 1 범위로 변환
        return amplitude * (2 * triangleValue - 1);
    }

    /**
     * 가우시안 화이트 노이즈 생성
     * @param {number} amplitude - 노이즈 강도
     * @returns {number} 노이즈 값
     */
    generateNoise(amplitude = 1) {
        // Box-Muller 변환을 사용한 가우시안 노이즈
        let u1 = Math.random();
        let u2 = Math.random();
        
        // 0이 되는 것을 방지
        while (u1 === 0) u1 = Math.random();
        
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return amplitude * z0;
    }

    /**
     * 복합 신호 생성 (기본 신호 + 노이즈)
     * @param {string} signalType - 신호 타입 ('sine', 'square', 'triangle', 'noise')
     * @param {number} frequency - 주파수 (Hz)
     * @param {number} amplitude - 진폭
     * @param {number} noiseLevel - 노이즈 레벨 (0~1)
     * @returns {number} 복합 신호 값
     */
    generateSignal(signalType, frequency, amplitude = 1, noiseLevel = 0) {
        let baseSignal = 0;

        switch (signalType) {
            case 'sine':
                baseSignal = this.generateSine(frequency, amplitude);
                break;
            case 'square':
                baseSignal = this.generateSquare(frequency, amplitude);
                break;
            case 'triangle':
                baseSignal = this.generateTriangle(frequency, amplitude);
                break;
            case 'noise':
                baseSignal = this.generateNoise(amplitude);
                break;
            default:
                baseSignal = this.generateSine(frequency, amplitude);
        }

        // 노이즈 추가
        const noise = this.generateNoise(noiseLevel);
        return baseSignal + noise;
    }

    /**
     * 시간을 한 스텝 진행
     */
    step() {
        this.time += this.timeStep;
    }

    /**
     * 시간 리셋
     */
    reset() {
        this.time = 0;
    }

    /**
     * 현재 시간 반환
     * @returns {number} 현재 시간
     */
    getCurrentTime() {
        return this.time;
    }

    /**
     * 샘플링 레이트 설정
     * @param {number} sampleRate - 새로운 샘플링 레이트
     */
    setSampleRate(sampleRate) {
        this.sampleRate = sampleRate;
        this.timeStep = 1 / sampleRate;
    }

    /**
     * 주파수 성분이 여러 개인 복합 신호 생성
     * @param {Array} frequencies - 주파수 배열
     * @param {Array} amplitudes - 각 주파수에 대한 진폭 배열
     * @param {number} noiseLevel - 노이즈 레벨
     * @returns {number} 복합 신호 값
     */
    generateComplexSignal(frequencies, amplitudes, noiseLevel = 0) {
        let signal = 0;
        
        for (let i = 0; i < frequencies.length; i++) {
            const freq = frequencies[i];
            const amp = amplitudes[i] || 1;
            signal += this.generateSine(freq, amp);
        }
        
        // 노이즈 추가
        if (noiseLevel > 0) {
            signal += this.generateNoise(noiseLevel);
        }
        
        return signal;
    }

    /**
     * 신호의 RMS(Root Mean Square) 값 계산
     * @param {Array} signalArray - 신호 데이터 배열
     * @returns {number} RMS 값
     */
    static calculateRMS(signalArray) {
        if (signalArray.length === 0) return 0;
        
        const sumOfSquares = signalArray.reduce((sum, value) => sum + value * value, 0);
        return Math.sqrt(sumOfSquares / signalArray.length);
    }

    /**
     * 신호의 평균값 계산
     * @param {Array} signalArray - 신호 데이터 배열
     * @returns {number} 평균값
     */
    static calculateMean(signalArray) {
        if (signalArray.length === 0) return 0;
        
        const sum = signalArray.reduce((sum, value) => sum + value, 0);
        return sum / signalArray.length;
    }

    /**
     * 신호의 표준편차 계산
     * @param {Array} signalArray - 신호 데이터 배열
     * @returns {number} 표준편차
     */
    static calculateStandardDeviation(signalArray) {
        if (signalArray.length === 0) return 0;
        
        const mean = this.calculateMean(signalArray);
        const variance = signalArray.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / signalArray.length;
        return Math.sqrt(variance);
    }
}

// 사용 예제 (테스트용)
/*
const generator = new SignalGenerator();

// 5Hz 사인파 생성
for (let i = 0; i < 100; i++) {
    const sineValue = generator.generateSignal('sine', 5, 1, 0.1);
    console.log(`Time: ${generator.getCurrentTime().toFixed(3)}, Signal: ${sineValue.toFixed(3)}`);
    generator.step();
}
*/

// 전역으로 내보내기 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.SignalGenerator = SignalGenerator;
}
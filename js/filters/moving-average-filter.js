// moving-average-filter.js - 이동평균 필터 구현

class MovingAverageFilter {
    constructor(windowSize = 10) {
        this.windowSize = windowSize;
        this.buffer = [];           // 데이터를 저장할 원형 버퍼
        this.bufferIndex = 0;       // 현재 버퍼 인덱스
        this.bufferFull = false;    // 버퍼가 가득 찼는지 여부
        this.sum = 0;               // 현재 윈도우의 합계 (효율적인 계산을 위해)
        
        // 버퍼 초기화
        this.buffer = new Array(windowSize).fill(0);
    }

    /**
     * 새로운 데이터 포인트를 필터에 입력하고 필터링된 값을 반환
     * @param {number} input - 입력 신호 값
     * @returns {number} 필터링된 출력 값
     */
    filter(input) {
        // 기존 값을 합계에서 제거
        this.sum -= this.buffer[this.bufferIndex];
        
        // 새로운 값을 버퍼에 저장
        this.buffer[this.bufferIndex] = input;
        
        // 새로운 값을 합계에 추가
        this.sum += input;
        
        // 버퍼 인덱스 업데이트 (원형 버퍼)
        this.bufferIndex = (this.bufferIndex + 1) % this.windowSize;
        
        // 버퍼가 한 번 가득 찼는지 체크
        if (!this.bufferFull && this.bufferIndex === 0) {
            this.bufferFull = true;
        }
        
        // 평균 계산
        const currentSize = this.bufferFull ? this.windowSize : this.bufferIndex || this.windowSize;
        return this.sum / currentSize;
    }

    /**
     * 윈도우 크기 변경
     * @param {number} newWindowSize - 새로운 윈도우 크기
     */
    setWindowSize(newWindowSize) {
        if (newWindowSize < 1) {
            throw new Error('윈도우 크기는 1 이상이어야 합니다.');
        }
        
        // 기존 데이터 백업
        const oldData = this.getCurrentData();
        
        // 새로운 크기로 초기화
        this.windowSize = newWindowSize;
        this.buffer = new Array(newWindowSize).fill(0);
        this.bufferIndex = 0;
        this.bufferFull = false;
        this.sum = 0;
        
        // 기존 데이터가 있다면 새 윈도우 크기에 맞게 복원
        if (oldData.length > 0) {
            const startIndex = Math.max(0, oldData.length - newWindowSize);
            for (let i = startIndex; i < oldData.length; i++) {
                this.filter(oldData[i]);
            }
        }
    }

    /**
     * 현재 윈도우 크기 반환
     * @returns {number} 현재 윈도우 크기
     */
    getWindowSize() {
        return this.windowSize;
    }

    /**
     * 현재 버퍼의 데이터 반환 (디버깅용)
     * @returns {Array} 현재 버퍼 데이터
     */
    getCurrentData() {
        if (!this.bufferFull) {
            return this.buffer.slice(0, this.bufferIndex);
        }
        
        // 원형 버퍼에서 올바른 순서로 데이터 반환
        const result = [];
        for (let i = 0; i < this.windowSize; i++) {
            const index = (this.bufferIndex + i) % this.windowSize;
            result.push(this.buffer[index]);
        }
        return result;
    }

    /**
     * 필터 초기화 (모든 데이터 제거)
     */
    reset() {
        this.buffer.fill(0);
        this.bufferIndex = 0;
        this.bufferFull = false;
        this.sum = 0;
    }

    /**
     * 현재 버퍼의 평균값 반환
     * @returns {number} 현재 평균값
     */
    getCurrentAverage() {
        const currentSize = this.bufferFull ? this.windowSize : this.bufferIndex;
        return currentSize > 0 ? this.sum / currentSize : 0;
    }

    /**
     * 현재 버퍼의 분산 계산
     * @returns {number} 분산값
     */
    getCurrentVariance() {
        const data = this.getCurrentData();
        if (data.length < 2) return 0;
        
        const mean = this.getCurrentAverage();
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        return variance;
    }

    /**
     * 현재 버퍼의 표준편차 계산
     * @returns {number} 표준편차
     */
    getCurrentStandardDeviation() {
        return Math.sqrt(this.getCurrentVariance());
    }

    /**
     * 필터의 지연시간 반환 (샘플 단위)
     * 이동평균 필터의 그룹 지연은 (N-1)/2 샘플
     * @returns {number} 지연 샘플 수
     */
    getGroupDelay() {
        return (this.windowSize - 1) / 2;
    }

    /**
     * 필터 응답 특성 정보 반환
     * @returns {Object} 필터 특성 정보
     */
    getFilterInfo() {
        return {
            type: 'Moving Average',
            windowSize: this.windowSize,
            groupDelay: this.getGroupDelay(),
            currentSize: this.bufferFull ? this.windowSize : this.bufferIndex,
            description: `${this.windowSize}개 샘플의 이동평균 필터`
        };
    }

    /**
     * 배치 처리 - 여러 데이터를 한번에 필터링
     * @param {Array} inputArray - 입력 데이터 배열
     * @returns {Array} 필터링된 출력 배열
     */
    filterBatch(inputArray) {
        const output = [];
        for (let i = 0; i < inputArray.length; i++) {
            output.push(this.filter(inputArray[i]));
        }
        return output;
    }

    /**
     * 필터 계수 반환 (FIR 필터로서의 계수)
     * @returns {Array} 필터 계수 배열
     */
    getCoefficients() {
        const coefficient = 1 / this.windowSize;
        return new Array(this.windowSize).fill(coefficient);
    }

    /**
     * 주파수 응답 계산 (이론적 값)
     * @param {number} frequency - 정규화된 주파수 (0~0.5, 나이퀴스트 주파수 = 0.5)
     * @returns {Object} {magnitude, phase} 주파수 응답
     */
    getFrequencyResponse(frequency) {
        if (frequency === 0) {
            return { magnitude: 1, phase: 0 };
        }
        
        const omega = 2 * Math.PI * frequency;
        const N = this.windowSize;
        
        // 이동평균 필터의 주파수 응답
        // H(ω) = (1/N) * sin(Nω/2) / sin(ω/2) * exp(-j(N-1)ω/2)
        const numerator = Math.sin(N * omega / 2);
        const denominator = N * Math.sin(omega / 2);
        const magnitude = Math.abs(numerator / denominator);
        
        // 위상 응답
        const phase = -(N - 1) * omega / 2;
        
        return { magnitude, phase };
    }

    /**
     * 스텝 응답 계산
     * @param {number} samples - 계산할 샘플 수
     * @returns {Array} 스텝 응답 배열
     */
    getStepResponse(samples = 50) {
        const tempFilter = new MovingAverageFilter(this.windowSize);
        const response = [];
        
        for (let i = 0; i < samples; i++) {
            const input = i >= 0 ? 1 : 0; // 스텝 입력
            response.push(tempFilter.filter(input));
        }
        
        return response;
    }
}

// 브라우저 환경에서 사용 가능하게 만들기
if (typeof window !== 'undefined') {
    window.MovingAverageFilter = MovingAverageFilter;
}

// 사용 예제 (테스트용)
/*
// 간단한 테스트
const filter = new MovingAverageFilter(5);
const testSignal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('이동평균 필터 테스트:');
testSignal.forEach((value, index) => {
    const filtered = filter.filter(value);
    console.log(`입력: ${value}, 출력: ${filtered.toFixed(3)}`);
});

// 필터 정보 출력
console.log('필터 정보:', filter.getFilterInfo());
*/
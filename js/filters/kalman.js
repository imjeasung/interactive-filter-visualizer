// js/filters/kalman.js - 1차원 칼만 필터 구현

class KalmanFilter {
    constructor(processNoise = 0.01, measurementNoise = 0.1, dt = 0.01) {
        // 칼만필터 파라미터
        this.processNoise = processNoise;      // Q - 프로세스 노이즈
        this.measurementNoise = measurementNoise; // R - 측정 노이즈
        this.dt = dt;                          // 시간 간격
        
        // 상태 벡터 [위치, 속도]
        this.state = [0, 0];                   // x = [position, velocity]
        
        // 오차 공분산 행렬 P (2x2)
        this.P = [
            [1, 0],
            [0, 1]
        ];
        
        // 상태 전이 행렬 F (2x2)
        // F = [[1, dt],
        //      [0, 1 ]]
        this.F = [
            [1, this.dt],
            [0, 1]
        ];
        
        // 관측 행렬 H (1x2) - 위치만 관측
        this.H = [1, 0];
        
        // 프로세스 노이즈 공분산 행렬 Q (2x2)
        this.Q = [
            [this.processNoise * Math.pow(this.dt, 4) / 4, this.processNoise * Math.pow(this.dt, 3) / 2],
            [this.processNoise * Math.pow(this.dt, 3) / 2, this.processNoise * Math.pow(this.dt, 2)]
        ];
        
        // 측정 노이즈 공분산 R (스칼라)
        this.R = this.measurementNoise;
        
        // 초기화 플래그
        this.isInitialized = false;
    }

    /**
     * 행렬 곱셈 (2x2) * (2x1)
     */
    multiplyMatrixVector(matrix, vector) {
        return [
            matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
            matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
        ];
    }

    /**
     * 행렬 곱셈 (2x2) * (2x2)
     */
    multiplyMatrix(A, B) {
        return [
            [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
            [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
        ];
    }

    /**
     * 행렬 덧셈 (2x2)
     */
    addMatrix(A, B) {
        return [
            [A[0][0] + B[0][0], A[0][1] + B[0][1]],
            [A[1][0] + B[1][0], A[1][1] + B[1][1]]
        ];
    }

    /**
     * 행렬 전치 (2x2)
     */
    transpose(matrix) {
        return [
            [matrix[0][0], matrix[1][0]],
            [matrix[0][1], matrix[1][1]]
        ];
    }

    /**
     * 스칼라와 행렬 곱셈
     */
    scalarMultiply(scalar, matrix) {
        return [
            [scalar * matrix[0][0], scalar * matrix[0][1]],
            [scalar * matrix[1][0], scalar * matrix[1][1]]
        ];
    }

    /**
     * 2x2 행렬의 역행렬
     */
    inverse2x2(matrix) {
        const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        if (Math.abs(det) < 1e-10) {
            // 특이행렬인 경우 단위행렬 반환
            return [[1, 0], [0, 1]];
        }
        
        return [
            [matrix[1][1] / det, -matrix[0][1] / det],
            [-matrix[1][0] / det, matrix[0][0] / det]
        ];
    }

    /**
     * 예측 단계 (Prediction Step)
     */
    predict() {
        // 상태 예측: x_k|k-1 = F * x_k-1|k-1
        this.state = this.multiplyMatrixVector(this.F, this.state);
        
        // 오차 공분산 예측: P_k|k-1 = F * P_k-1|k-1 * F^T + Q
        const FT = this.transpose(this.F);
        const FP = this.multiplyMatrix(this.F, this.P);
        const FPFT = this.multiplyMatrix(FP, FT);
        this.P = this.addMatrix(FPFT, this.Q);
    }

    /**
     * 업데이트 단계 (Update Step)
     */
    update(measurement) {
        // 잔차(innovation): y = z - H * x_k|k-1
        const Hx = this.H[0] * this.state[0] + this.H[1] * this.state[1];
        const y = measurement - Hx;
        
        // 잔차 공분산: S = H * P_k|k-1 * H^T + R
        const HP = [
            this.H[0] * this.P[0][0] + this.H[1] * this.P[1][0],
            this.H[0] * this.P[0][1] + this.H[1] * this.P[1][1]
        ];
        const S = HP[0] * this.H[0] + HP[1] * this.H[1] + this.R;
        
        if (Math.abs(S) < 1e-10) return; // 분모가 0에 가까우면 업데이트 스킵
        
        // 칼만 게인: K = P_k|k-1 * H^T * S^-1
        const PH = [this.P[0][0] * this.H[0] + this.P[0][1] * this.H[1],
                    this.P[1][0] * this.H[0] + this.P[1][1] * this.H[1]];
        const K = [PH[0] / S, PH[1] / S];
        
        // 상태 업데이트: x_k|k = x_k|k-1 + K * y
        this.state[0] += K[0] * y;
        this.state[1] += K[1] * y;
        
        // 오차 공분산 업데이트: P_k|k = (I - K * H) * P_k|k-1
        const KH = [
            [K[0] * this.H[0], K[0] * this.H[1]],
            [K[1] * this.H[0], K[1] * this.H[1]]
        ];
        const I_KH = [
            [1 - KH[0][0], -KH[0][1]],
            [-KH[1][0], 1 - KH[1][1]]
        ];
        this.P = this.multiplyMatrix(I_KH, this.P);
    }

    /**
     * 필터링 메인 함수
     */
    filter(measurement) {
        if (!this.isInitialized) {
            // 첫 번째 측정값으로 초기화
            this.state[0] = measurement;
            this.state[1] = 0; // 초기 속도는 0
            this.isInitialized = true;
            return measurement;
        }

        // 예측 -> 업데이트
        this.predict();
        this.update(measurement);
        
        return this.state[0]; // 추정된 위치 반환
    }

    /**
     * 프로세스 노이즈 설정
     */
    setProcessNoise(processNoise) {
        this.processNoise = processNoise;
        this.updateQ();
    }

    /**
     * 측정 노이즈 설정
     */
    setMeasurementNoise(measurementNoise) {
        this.measurementNoise = measurementNoise;
        this.R = measurementNoise;
    }

    /**
     * Q 행렬 업데이트
     */
    updateQ() {
        this.Q = [
            [this.processNoise * Math.pow(this.dt, 4) / 4, this.processNoise * Math.pow(this.dt, 3) / 2],
            [this.processNoise * Math.pow(this.dt, 3) / 2, this.processNoise * Math.pow(this.dt, 2)]
        ];
    }

    /**
     * 필터 상태 리셋
     */
    reset() {
        this.state = [0, 0];
        this.P = [
            [1, 0],
            [0, 1]
        ];
        this.isInitialized = false;
    }

    /**
     * 현재 필터 정보 반환
     */
    getInfo() {
        return {
            type: 'Kalman Filter (1D)',
            processNoise: this.processNoise,
            measurementNoise: this.measurementNoise,
            state: [...this.state],
            estimatedPosition: this.state[0],
            estimatedVelocity: this.state[1]
        };
    }

    /**
     * 현재 추정 속도 반환
     */
    getVelocity() {
        return this.state[1];
    }

    /**
     * 예측 품질 평가 (P 행렬의 trace)
     */
    getUncertainty() {
        return this.P[0][0] + this.P[1][1]; // trace of P matrix
    }
}

// 모듈로 내보내기 (Node.js 환경에서 사용시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KalmanFilter;
}
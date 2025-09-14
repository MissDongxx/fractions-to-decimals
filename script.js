class LongDivisionDemo {
    constructor() {
        this.dividend = '';
        this.divisor = '';
        this.decimals = 2;
        this.steps = [];
        this.currentStep = 0;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.dividendInput = document.getElementById('dividend');
        this.divisorInput = document.getElementById('divisor');
        this.decimalsInput = document.getElementById('decimals');
        this.generateBtn = document.getElementById('generateBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.stage = document.getElementById('stage');
        this.longDivision = document.getElementById('longDivision');
    }
    
    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generate());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.restartBtn.addEventListener('click', () => this.restart());
        
        // 输入验证
        this.dividendInput.addEventListener('input', (e) => this.validateNumberInput(e, 10));
        this.divisorInput.addEventListener('input', (e) => this.validateNumberInput(e, 10));
        this.decimalsInput.addEventListener('input', (e) => this.validateDecimalInput(e));
    }
    
    validateNumberInput(event, maxLength) {
        let value = event.target.value;
        // 允许负号在开头
        value = value.replace(/[^-0-9]/g, '');
        if (value.indexOf('-') > 0) {
            value = value.replace(/-/g, '');
        }
        if (value.length > maxLength + (value.startsWith('-') ? 1 : 0)) {
            value = value.substring(0, maxLength + (value.startsWith('-') ? 1 : 0));
        }
        event.target.value = value;
    }
    
    validateDecimalInput(event) {
        let value = parseInt(event.target.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 10) value = 10;
        event.target.value = value;
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        setTimeout(() => {
            this.errorMessage.classList.remove('show');
        }, 5000);
    }
    
    hideError() {
        this.errorMessage.classList.remove('show');
    }
    
    generate() {
        this.hideError();
        
        // 获取输入值
        const dividendValue = this.dividendInput.value.trim();
        const divisorValue = this.divisorInput.value.trim();
        const decimalsValue = parseInt(this.decimalsInput.value);
        
        // 验证输入
        if (!dividendValue || !divisorValue) {
            this.showError('请输入被除数和除数');
            return;
        }
        
        const dividend = parseInt(dividendValue);
        const divisor = parseInt(divisorValue);
        
        if (isNaN(dividend) || isNaN(divisor)) {
            this.showError('请输入有效的数字');
            return;
        }
        
        if (divisor === 0) {
            this.showError('除数不能为0');
            return;
        }
        
        // 设置属性
        this.dividend = dividend;
        this.divisor = divisor;
        this.decimals = decimalsValue;
        
        // 计算步骤
        this.steps = this.computeDivisionSteps();
        this.currentStep = 0;
        
        // 生成布局
        this.generateLayout();
        
        // 更新按钮状态
        this.updateButtonStates();
    }
    
    computeDivisionSteps() {
        const steps = [];
        const dividend = Math.abs(this.dividend);
        const divisor = Math.abs(this.divisor);
        const dividendStr = dividend.toString();
        
        let workingNumber = 0;
        let decimalStarted = false;
        let decimalCount = 0;
        let extendedDividend = dividendStr;
        
        for (let i = 0; i < dividendStr.length || (decimalCount < this.decimals && workingNumber > 0); i++) {
            let digit;
            let isDecimalDigit = false;
            let previousRemainder = workingNumber;
            
            if (i < dividendStr.length) {
                digit = parseInt(dividendStr[i]);
            } else {
                digit = 0;
                isDecimalDigit = true;
                if (!decimalStarted) {
                    extendedDividend += '.';
                    decimalStarted = true;
                }
                extendedDividend += '0';
                decimalCount++;
            }
            
            workingNumber = workingNumber * 10 + digit;
            
            const quotientDigit = Math.floor(workingNumber / divisor);
            const product = quotientDigit * divisor;
            const remainder = workingNumber - product;
            
            // 计算精确位置
            const productStr = product.toString();
            const productDigitPositions = [];
            
            for (let j = 0; j < productStr.length; j++) {
                productDigitPositions.push(i - (productStr.length - 1) + j);
            }
            
            const remainderPosition = i;
            const bringDownPosition = i;
            
            steps.push({
                stepIndex: steps.length,
                dividendPosition: i,
                previousRemainder: previousRemainder,
                bringDownDigit: digit,
                workingNumber: workingNumber,
                quotientDigit: quotientDigit,
                product: product,
                remainder: remainder,
                isDecimal: isDecimalDigit,
                extendedDividend: extendedDividend,
                quotientAlignPos: i,
                productAlignPos: i,
                productDigitPositions: productDigitPositions,
                remainderPosition: remainderPosition,
                bringDownPosition: bringDownPosition
            });
            
            workingNumber = remainder;
            
            if (remainder === 0 && isDecimalDigit) {
                break;
            }
        }
        
        return steps;
    }
    
    generateLayout() {
        const isNegative = this.dividend < 0;
        const dividendStr = Math.abs(this.dividend).toString();
        const divisorStr = Math.abs(this.divisor).toString();
        
        this.longDivision.innerHTML = `
            <div class="divisor-section">
                <div class="divisor-number ${this.divisor < 0 ? 'negative' : ''}">${divisorStr}</div>
                <div class="division-symbol"></div>
            </div>
            <div class="calculation-area">
                <div class="quotient-row" id="quotientRow">
                    ${this.dividend < 0 !== this.divisor < 0 ? '<span class="quotient-digit negative">-</span>' : ''}
                </div>
                <div class="dividend-row" id="dividendRow">
                    ${isNegative ? '<span class="dividend-digit negative">-</span>' : ''}
                    ${dividendStr.split('').map((digit, index) => 
                        `<span class="dividend-digit" data-index="${index}">${digit}</span>`
                    ).join('')}
                </div>
                <div class="steps-area" id="stepsArea">
                </div>
            </div>
        `;
        
        // 初始状态不显示任何步骤，等待用户点击"下一步"
        this.currentStep = -1;
    }
    
    displayStep(stepIndex) {
        if (stepIndex < -1 || stepIndex >= this.steps.length) return;
        
        // 如果stepIndex为-1，表示初始状态，不显示任何计算步骤
        if (stepIndex === -1) {
            document.getElementById('stepsArea').innerHTML = '';
            // 清除商的显示
            document.getElementById('quotientRow').innerHTML = '';
            // 恢复被除数的原始显示（不带小数点和补零）
            const dividendRow = document.getElementById('dividendRow');
            const isNegative = this.dividend < 0;
            const dividendStr = Math.abs(this.dividend).toString();
            dividendRow.innerHTML = `
                ${isNegative ? '<span class="dividend-digit negative">-</span>' : ''}
                ${dividendStr.split('').map((digit, index) => 
                    `<span class="dividend-digit" data-index="${index}">${digit}</span>`
                ).join('')}
            `;
            return;
        }
        
        this.updateDividendDisplay(stepIndex);
        this.updateQuotientDisplay(stepIndex);
        this.updateStepsDisplay(stepIndex);
        this.highlightCurrentDividend(stepIndex);
    }
    
    updateDividendDisplay(stepIndex) {
        const dividendRow = document.getElementById('dividendRow');
        const step = this.steps[stepIndex];
        const isNegative = this.dividend < 0;
        
        const extendedDividendStr = step.extendedDividend;
        
        let dividendHTML = isNegative ? '<span class="dividend-digit negative">-</span>' : '';
        
        const parts = extendedDividendStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';
        
        integerPart.split('').forEach((digit, index) => {
            dividendHTML += `<span class="dividend-digit" data-index="${index}">${digit}</span>`;
        });
        
        if (decimalPart) {
            dividendHTML += '<span class="dividend-digit decimal-point">.</span>';
            decimalPart.split('').forEach((digit, index) => {
                const actualIndex = integerPart.length + index;
                dividendHTML += `<span class="dividend-digit decimal-digit" data-index="${actualIndex}">${digit}</span>`;
            });
        }
        
        dividendRow.innerHTML = dividendHTML;
    }
    
    updateQuotientDisplay(stepIndex) {
        const quotientRow = document.getElementById('quotientRow');
        const digitWidth = 30;
        
        let quotientHTML = '';
        
        if (this.dividend < 0 !== this.divisor < 0) {
            quotientHTML += '<span class="quotient-digit negative">-</span>';
        }
        
        const dividendStr = Math.abs(this.dividend).toString();
        let decimalAdded = false;
        
        for (let pos = 0; pos < dividendStr.length; pos++) {
            let digitContent = '';
            
            for (let i = 0; i <= stepIndex; i++) {
                const step = this.steps[i];
                if (step.quotientAlignPos === pos) {
                    if (step.isDecimal && !decimalAdded) {
                        digitContent = '.' + step.quotientDigit;
                        decimalAdded = true;
                    } else {
                        digitContent = step.quotientDigit.toString();
                    }
                    break;
                }
            }
            
            quotientHTML += `<span class="quotient-digit" style="min-width: ${digitWidth}px; text-align: center; display: inline-block;">${digitContent}</span>`;
        }
        
        if (stepIndex >= 0 && this.steps[stepIndex].isDecimal && !decimalAdded) {
            quotientHTML += '<span class="quotient-digit">.</span>';
            for (let i = 0; i <= stepIndex; i++) {
                const step = this.steps[i];
                if (step.isDecimal) {
                    quotientHTML += `<span class="quotient-digit">${step.quotientDigit}</span>`;
                }
            }
        }
        
        quotientRow.innerHTML = quotientHTML;
    }
    
    updateStepsDisplay(stepIndex) {
        const stepsArea = document.getElementById('stepsArea');
        let stepsHTML = '';
        
        for (let i = 0; i <= stepIndex; i++) {
            const step = this.steps[i];
            
            if (step.quotientDigit === 0 && i === 0 && this.steps.length > 1) {
                continue;
            }
            
            const productStr = step.product.toString();
            
            // 构建乘积的分位显示
            let productHTML = '';
            productStr.split('').forEach((digit, digitIndex) => {
                const digitPos = this.calculateDigitPosition(step.productDigitPositions[digitIndex]);
                productHTML += `<span class="product-digit" style="position: absolute; left: ${digitPos}px;">${digit}</span>`;
            });
            
            // 构建余数和带下数字的组合显示
            let remainderHTML = '';
            let bringDownHTML = '';
            const nextStep = this.steps[i + 1];
            
            if (step.remainder === 0) {
                // 余数为0时，显示0和带下数字的组合
                const remainderPos = this.calculateDigitPosition(step.remainderPosition);
                remainderHTML = `<span class="remainder-digit" style="position: absolute; left: ${remainderPos}px;">0</span>`;
                
                // 如果有下一步且当前步骤已显示，显示带下数字
                if (nextStep && i < stepIndex) {
                    const bringDownPos = this.calculateDigitPosition(step.remainderPosition + 1);
                    bringDownHTML = `<span class="bring-down-digit" style="position: absolute; left: ${bringDownPos}px;">${nextStep.bringDownDigit}</span>`;
                }
            } else {
                // 余数不为0时的正常显示
                const remainderStr = step.remainder.toString();
                // 余数的个位对齐到乘积的个位下方
                const remainderStartPos = step.productDigitPositions[step.productDigitPositions.length - 1];
                remainderStr.split('').forEach((digit, digitIndex) => {
                    const digitPos = this.calculateDigitPosition(remainderStartPos - (remainderStr.length - 1) + digitIndex);
                    remainderHTML += `<span class="remainder-digit" style="position: absolute; left: ${digitPos}px;">${digit}</span>`;
                });
                
                // 显示带下数字（如果需要）
                if (nextStep && i < stepIndex) {
                    const bringDownPos = this.calculateDigitPosition(remainderStartPos + 1);
                    bringDownHTML = `<span class="bring-down-digit" style="position: absolute; left: ${bringDownPos}px;">${nextStep.bringDownDigit}</span>`;
                }
            }
            
            // 计算减法线的位置和宽度
            const lineStartPos = this.calculateDigitPosition(step.productDigitPositions[0]);
            const lineEndPos = this.calculateDigitPosition(step.productDigitPositions[step.productDigitPositions.length - 1]) + 30;
            const lineWidth = lineEndPos - lineStartPos;
            
            stepsHTML += `
                <div class="step-row" data-step="${i}" style="position: relative; height: 80px;">
                    <div class="product-row" style="position: relative; height: 30px;">
                        ${productHTML}
                    </div>
                    <div class="subtraction-line" style="position: absolute; left: ${lineStartPos}px; width: ${lineWidth}px; top: 30px;"></div>
                    <div class="remainder-row" style="position: relative; height: 30px; top: 10px;">
                        ${remainderHTML}
                        ${bringDownHTML}
                    </div>
                </div>
            `;
        }
        
        stepsArea.innerHTML = stepsHTML;
    }
    
    calculateAlignment(position, numberLength) {
        const digitWidth = 30;
        let actualPosition = position;
        
        const originalDividendLength = Math.abs(this.dividend).toString().length;
        if (position >= originalDividendLength) {
            actualPosition = position + 1;
        }
        
        return actualPosition * digitWidth - (numberLength - 1) * digitWidth;
    }
    
    calculateRemainderAlignment(step, remainderLength) {
        const digitWidth = 30;
        let actualPosition = step.productAlignPos;
        
        const originalDividendLength = Math.abs(this.dividend).toString().length;
        if (step.productAlignPos >= originalDividendLength) {
            actualPosition = step.productAlignPos + 1;
        }
        
        return actualPosition * digitWidth - (remainderLength - 1) * digitWidth;
    }
    
    calculateDigitPosition(position) {
        const digitWidth = 30;
        const originalDividendLength = Math.abs(this.dividend).toString().length;
        
        if (position >= originalDividendLength) {
            return (position + 1) * digitWidth;
        }
        return position * digitWidth;
    }
    
    highlightCurrentDividend(stepIndex) {
        document.querySelectorAll('.dividend-digit').forEach(digit => {
            digit.classList.remove('highlight');
        });
        
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            const step = this.steps[stepIndex];
            for (let i = 0; i <= step.dividendPosition; i++) {
                const digitElement = document.querySelector(`.dividend-digit[data-index="${i}"]`);
                if (digitElement) {
                    digitElement.classList.add('highlight');
                }
            }
        }
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.displayStep(this.currentStep);
            this.updateButtonStates();
        }
    }
    
    prevStep() {
        if (this.currentStep > -1) {
            this.currentStep--;
            this.displayStep(this.currentStep);
            this.updateButtonStates();
        }
    }
    
    restart() {
        this.currentStep = -1;
        this.displayStep(-1);
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        const hasSteps = this.steps.length > 0;
        
        this.nextBtn.disabled = !hasSteps || this.currentStep >= this.steps.length - 1;
        this.prevBtn.disabled = !hasSteps || this.currentStep <= 0;
        this.restartBtn.disabled = !hasSteps;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LongDivisionDemo();
});
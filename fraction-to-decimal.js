class LongDivisionDemo {
    constructor() {
        this.dividend = '';
        this.divisor = '';
        this.decimals = 2;
        this.steps = [];
        this.currentStep = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateExplanation();
    }
        // 计算“即时结果”所需表示：pretty/ellipsis/百分比/类型
    fractionToDecimalPretty(n, d, maxDigits = 150) {
        const sign = (n < 0) ^ (d < 0) ? '-' : '';
        n = Math.abs(Number(n)); d = Math.abs(Number(d));
        if (!d) return { pretty: '—', ellipsis: '—', repeating: false };

        const intPart = Math.floor(n / d);
        let remainder = n % d;
        if (remainder === 0) {
            const v = sign + String(intPart);
            return { pretty: v, ellipsis: v, repeating: false };
        }
        const seen = new Map(); const digits = [];
        let repIdx = -1;
        for (let i = 0; remainder !== 0 && i < maxDigits; i++) {
            if (seen.has(remainder)) { repIdx = seen.get(remainder); break; }
            seen.set(remainder, digits.length);
            remainder *= 10;
            digits.push(Math.floor(remainder / d));
            remainder %= d;
        }
        const base = sign + intPart + '.';
        if (repIdx === -1) {
            const dec = digits.join('');
            return { pretty: base + dec, ellipsis: base + dec, repeating: false };
        } else {
            const non = digits.slice(0, repIdx).join('');
            const rep = digits.slice(repIdx).join('');
            const pretty = base + (non ? non : '') + `(${rep})`;
            const ellipsis = base + (non ? non : '') + rep.repeat(Math.ceil(12/rep.length)).slice(0,12) + '...';
            return { pretty, ellipsis, repeating: true };
        }
    }

    updateResultSummary() {
        const exprEl = document.getElementById('resultExpression');
        const prettyEl = document.getElementById('resultDecimalPretty');
        const ellipsisEl = document.getElementById('resultDecimalEllipsis');
        const pctEl = document.getElementById('resultPercentage');
        const typeEl = document.getElementById('resultType');

        if (!exprEl) return;

        const n = this.dividend;
        const d = this.divisor;
        const { pretty, ellipsis, repeating } = this.fractionToDecimalPretty(n, d, Math.max(50, Number(this.decimals)||0));
        exprEl.textContent = `${n}/${d}`;
        prettyEl.textContent = pretty;
        ellipsisEl.textContent = ellipsis;
        pctEl.textContent = ((Number(d) === 0) ? '—' : ((Number(n)/Number(d))*100).toFixed(2) + '%');
        typeEl.textContent = repeating ? this.getTranslation('type_repeating') : this.getTranslation('type_terminating');
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
        this.explanationPanel = document.getElementById('explanationPanel');
        this.explanationContent = document.getElementById('explanationContent');
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
        // 允许数字、小数点、负号
        value = value.replace(/[^-0-9.]/g, '');
        
        // 确保负号只在开头
        if (value.indexOf('-') > 0) {
            value = value.replace(/-/g, '');
        }
        
        // 确保只有一个小数点
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // 限制总长度
        if (value.length > maxLength + (value.startsWith('-') ? 1 : 0)) {
            value = value.substring(0, maxLength + (value.startsWith('-') ? 1 : 0));
        }
        
        event.target.value = value;
    }
    
    // 标准化输入格式
    normalizeInput(input) {
        let value = input.trim();
        
        // .5 -> 0.5
        if (value.startsWith('.') && value.length > 1) {
            value = '0' + value;
        }
        
        // -.5 -> -0.5
        if (value.startsWith('-.')) {
            value = '-0' + value.slice(1);
        }
        
        // 12. -> 12
        if (value.endsWith('.') && value !== '.') {
            value = value.slice(0, -1);
        }
        
        return value;
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

    // 重置演示区（清空画布/说明，禁用控制按钮）
    resetDemo() {
        // 清空步骤与状态
        this.steps = [];
        this.currentStep = -1;

        // 清空画布
        if (this.longDivision) this.longDivision.innerHTML = '';
        if (this.explanationContent) this.explanationContent.innerHTML = '';

        // 禁用按钮
        if (this.nextBtn) this.nextBtn.disabled = true;
        if (this.prevBtn) this.prevBtn.disabled = true;
        if (this.restartBtn) this.restartBtn.disabled = true;

        // 隐藏错误
        this.hideError();
    }
    
    generate() {
        // 先重置演示区
        this.resetDemo();
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
        
        // 标准化输入
        const normalizedDividend = this.normalizeInput(dividendValue);
        const normalizedDivisor = this.normalizeInput(divisorValue);
        
        const dividend = parseFloat(normalizedDividend);
        const divisor = parseFloat(normalizedDivisor);
        
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
        this.steps = this.computeDecimalDivisionSteps();
        this.currentStep = 0;
        
        // 生成布局
        this.generateLayout();
        
        // 更新按钮状态
        this.updateButtonStates();
        
        // 更新说明面板
        this.updateExplanation();

        // 刷新“即时结果”区
        this.updateResultSummary();
    }
    
    computeDecimalDivisionSteps() {
        const steps = [];
        
        // 获取绝对值
        const dividend = Math.abs(this.dividend);
        const divisor = Math.abs(this.divisor);
        
        // 将小数转换为整数进行计算，但保持原始显示格式
        const dividendStr = dividend.toString();
        const divisorStr = divisor.toString();
        
        // 计算需要移动的小数位数
        const dividendDecimals = (dividendStr.split('.')[1] || '').length;
        const divisorDecimals = (divisorStr.split('.')[1] || '').length;
        
        // 将除数转换为整数
        const intDivisor = Math.round(divisor * Math.pow(10, divisorDecimals));
        
        // 构建被除数数字数组（包含小数点信息）
        const dividendDigits = [];
        let decimalPointIndex = -1;
        
        for (let i = 0; i < dividendStr.length; i++) {
            const char = dividendStr[i];
            if (char === '.') {
                decimalPointIndex = dividendDigits.length;
            } else {
                dividendDigits.push(parseInt(char));
            }
        }
        
        // 如果除数有小数位，需要在被除数后补零
        if (divisorDecimals > dividendDecimals) {
            const zerosToAdd = divisorDecimals - dividendDecimals;
            for (let i = 0; i < zerosToAdd; i++) {
                dividendDigits.push(0);
            }
            if (decimalPointIndex === -1) {
                decimalPointIndex = dividendDigits.length - zerosToAdd;
            }
        }
        
        // 计算商中小数点的位置
        let quotientDecimalPos = decimalPointIndex;
        if (divisorDecimals > 0) {
            quotientDecimalPos = decimalPointIndex - divisorDecimals;
        }
        
        // 如果被除数是整数（没有小数点），需要添加小数点和至少一个0
        let extendedDividend = dividendStr;
        if (decimalPointIndex === -1) {
            quotientDecimalPos = dividendDigits.length;
            decimalPointIndex = dividendDigits.length;
            // 为整数被除数添加至少一个小数位0，以便进行小数除法
            dividendDigits.push(0);
            extendedDividend = dividendStr + '.0';
        }
        
        let workingNumber = 0;
        let quotientDecimalCount = 0; // 商的小数位数计数
        let addedDecimalPoint = false;
        
        for (let i = 0; i < dividendDigits.length || (quotientDecimalCount <= this.decimals && workingNumber > 0); i++) {
            let digit;
            let isDecimalDigit = false;
            let previousRemainder = workingNumber;
            
            if (i < dividendDigits.length) {
                digit = dividendDigits[i];
                // 检查当前位置是否是小数位
                isDecimalDigit = i >= decimalPointIndex;
            } else {
                // 添加小数位
                digit = 0;
                isDecimalDigit = true;
                if (!addedDecimalPoint && !extendedDividend.includes('.')) {
                    extendedDividend += '.';
                    addedDecimalPoint = true;
                }
                extendedDividend += '0';
            }
            
            workingNumber = workingNumber * 10 + digit;
            
            const quotientDigit = Math.floor(workingNumber / intDivisor);
            const product = quotientDigit * intDivisor;
            const remainder = workingNumber - product;
            
            // 计算乘积数字的位置
            const productStr = product.toString();
            const productDigitPositions = [];
            
            // 乘积的个位数应该与当前处理的被除数位对齐
            // i 是当前处理的被除数数字的索引位置
            const productStartPos = i - (productStr.length - 1);
            for (let j = 0; j < productStr.length; j++) {
                productDigitPositions.push(productStartPos + j);
            }
            

            
            // 判断是否需要在商中显示小数点
            // 当处理到小数点位置时，在下一个数字前显示小数点
            const shouldShowDecimalInQuotient = (i === quotientDecimalPos);
            
            // 如果当前步骤产生的商位在小数点后，增加商的小数位计数
            if (i >= quotientDecimalPos) {
                quotientDecimalCount++;
            }
            
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
                shouldShowDecimalInQuotient: shouldShowDecimalInQuotient,
                extendedDividend: extendedDividend,
                quotientAlignPos: i,
                productAlignPos: i,
                productDigitPositions: productDigitPositions,
                remainderPosition: i,
                bringDownPosition: i
            });
            
            workingNumber = remainder;
            
            // 只有在达到所需的小数位数后，且余数为0时才退出
            if (remainder === 0 && isDecimalDigit && quotientDecimalCount > this.decimals) {
                break;
            }
        }
        
        return steps;
    }
    
    generateLayout() {
        const dividendStr = Math.abs(this.dividend).toString();
        const divisorStr = Math.abs(this.divisor).toString();
        
        // 生成被除数的HTML，支持小数点显示
        const dividendHTML = this.generateDividendHTML(dividendStr);
        
        this.longDivision.innerHTML = `
            <div class="divisor-section">
                <div class="divisor-number">${divisorStr}</div>
                <div class="division-symbol"></div>
            </div>
            <div class="calculation-area">
                <div class="quotient-row" id="quotientRow">
                    <!-- 商将在计算过程中动态添加 -->
                </div>
                <div class="dividend-row" id="dividendRow">
                    ${dividendHTML}
                </div>
                <div class="steps-area" id="stepsArea">
                </div>
            </div>
        `;
        
        // 初始状态不显示任何步骤，等待用户点击"下一步"
        this.currentStep = -1;
    }
    
    generateDividendHTML(dividendStr) {
        let html = '';
        let index = 0;
        
        for (let i = 0; i < dividendStr.length; i++) {
            const char = dividendStr[i];
            if (char === '.') {
                html += '<span class="dividend-digit decimal-point">.</span>';
            } else {
                html += `<span class="dividend-digit" data-index="${index}">${char}</span>`;
                index++;
            }
        }
        
        return html;
    }
    
    displayStep(stepIndex) {
        if (stepIndex < -1 || stepIndex >= this.steps.length) return;
        
        // 如果stepIndex为-1，表示初始状态，不显示任何计算步骤
        if (stepIndex === -1) {
            document.getElementById('stepsArea').innerHTML = '';
            // 清除商的显示（演示过程中不显示负号）
            const quotientRow = document.getElementById('quotientRow');
            quotientRow.innerHTML = '';
            
            // 恢复被除数的原始显示（只显示绝对值）
            const dividendRow = document.getElementById('dividendRow');
            const dividendStr = Math.abs(this.dividend).toString();
            const dividendHTML = this.generateDividendHTML(dividendStr);
            dividendRow.innerHTML = dividendHTML;
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
        
        // 获取原始被除数字符串（只使用绝对值）
        const originalDividendStr = Math.abs(this.dividend).toString();
        
        // 判断是否需要显示小数部分
        // 只有当前步骤是小数步骤时，才显示扩展的被除数
        const shouldShowDecimal = stepIndex >= 0 && this.steps[stepIndex].isDecimal;
        
        let dividendHTML = '';
        
        if (shouldShowDecimal) {
            // 显示扩展的被除数（包含小数部分）
            const extendedDividendStr = step.extendedDividend;
            let digitIndex = 0;
            
            for (let i = 0; i < extendedDividendStr.length; i++) {
                const char = extendedDividendStr[i];
                if (char === '.') {
                    dividendHTML += '<span class="dividend-digit decimal-point">.</span>';
                } else {
                    dividendHTML += `<span class="dividend-digit" data-index="${digitIndex}">${char}</span>`;
                    digitIndex++;
                }
            }
        } else {
            // 只显示原始被除数（整数部分）
            originalDividendStr.split('').forEach((digit, index) => {
                if (digit === '.') {
                    dividendHTML += '<span class="dividend-digit decimal-point">.</span>';
                } else {
                    dividendHTML += `<span class="dividend-digit" data-index="${index}">${digit}</span>`;
                }
            });
        }
        
        dividendRow.innerHTML = dividendHTML;
    }
    
    updateQuotientDisplay(stepIndex) {
        const quotientRow = document.getElementById('quotientRow');
        const digitWidth = 30;
        
        let quotientHTML = '';
        
        // 演示过程中不显示负号，只显示绝对值的计算结果
        // 负号将在最终结果中单独处理
        
        // 按顺序显示商的每一位（不进行四舍五入）
        let decimalAdded = false;
        
        for (let i = 0; i <= stepIndex; i++) {
            const step = this.steps[i];
            
            // 检查是否需要在此位置添加小数点
            if (step.shouldShowDecimalInQuotient && !decimalAdded) {
                quotientHTML += '<span class="quotient-digit decimal-point">.</span>';
                decimalAdded = true;
            }
            
            // 添加商的数字
            const digitClass = step.isDecimal ? 'quotient-digit decimal-digit' : 'quotient-digit';
            quotientHTML += `<span class="${digitClass}" style="min-width: ${digitWidth}px; text-align: center; display: inline-block;">${step.quotientDigit}</span>`;
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
        
        // 直接查找对应 data-index 的元素位置
        const digitElement = document.querySelector(`.dividend-digit[data-index="${position}"]`);
        if (digitElement) {
            // 计算该元素在被除数行中的位置
            const dividendRow = document.getElementById('dividendRow');
            const allElements = Array.from(dividendRow.children);
            const elementIndex = allElements.indexOf(digitElement);
            
            return elementIndex * digitWidth;
        }
        
        // 如果找不到元素，使用备用逻辑
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
            this.updateExplanation();
        } else if (this.currentStep === this.steps.length - 1) {
            // 从最后一个计算步骤进入最终结果步骤
            this.currentStep++;
            this.updateButtonStates();
            this.updateExplanation();
        }
    }
    
    prevStep() {
        if (this.currentStep > -1) {
            this.currentStep--;
            this.displayStep(this.currentStep);
            this.updateButtonStates();
            this.updateExplanation();
        }
    }
    
    restart() {
        this.currentStep = -1;
        this.displayStep(-1);
        this.updateButtonStates();
        this.updateExplanation();
    }
    
    updateButtonStates() {
        const hasSteps = this.steps.length > 0;
        
        // 更新按钮文本和状态
        if (hasSteps && this.currentStep === this.steps.length - 1) {
            // 最后一个计算步骤，按钮显示"最终结果"
            this.nextBtn.textContent = this.getTranslation('finalResult');
            this.nextBtn.disabled = false;
        } else if (hasSteps && this.currentStep === this.steps.length) {
            // 最终结果步骤，按钮变灰不可点击
            this.nextBtn.textContent = this.getTranslation('finalResult');
            this.nextBtn.disabled = true;
        } else {
            // 正常步骤，显示"下一步"
            this.nextBtn.textContent = this.getTranslation('nextStep');
            // 只有当没有步骤或者已经到达最后一个计算步骤时才禁用
            // currentStep从-1开始，到steps.length-2都应该可以点击
            this.nextBtn.disabled = !hasSteps || this.currentStep >= this.steps.length - 1;
        }
        
        this.prevBtn.disabled = !hasSteps || this.currentStep <= 0;
        this.restartBtn.disabled = !hasSteps;
    }
    
    updateExplanation() {
        if (!this.explanationContent) return;
        
        let explanationText = '';
        
        if (this.steps.length === 0) {
            // 没有开始计算
            if (this.dividend && this.divisor) {
                explanationText = `<h3>${this.getTranslation('explanationTitle')}</h3><p>${this.getTranslation('prepareCalculation')} ${this.dividend} ÷ ${this.divisor}${this.getPunctuation('comma')} ${this.getTranslation('clickNextStep')}${this.getPunctuation('quote')}${this.getTranslation('generate')}${this.getPunctuation('quote')}${this.getTranslation('startDemo')}${this.getPunctuation('period')}</p>`;
            } else {
                explanationText = `<h3>${this.getTranslation('explanationTitle')}</h3><p>${this.getTranslation('inputDividendDivisor')} ${this.getPunctuation('quote')}${this.getTranslation('generate')}${this.getPunctuation('quote')} ${this.getTranslation('startLongDivision')}${this.getPunctuation('period')}</p>`;
            }
        } else if (this.currentStep === -1) {
            // 初始状态 - 显示布局但未开始计算
            const hasNegative = this.dividend < 0 || this.divisor < 0;
            const absDividend = Math.abs(this.dividend);
            const absDivisor = Math.abs(this.divisor);
            
            if (hasNegative) {
                explanationText = `<h3>${this.getTranslation('explanationTitle')}</h3><p>${this.getTranslation('beforeCalculation')}</p>`;
            } else {
                explanationText = `<h3>${this.getTranslation('explanationTitle')}</h3><p>${this.getTranslation('prepareCalculation')} ${absDividend} ÷ ${absDivisor}${this.getPunctuation('period')} ${this.getTranslation('clickNextStep')} ${this.getPunctuation('quote')}${this.getTranslation('nextStep')}${this.getPunctuation('quote')} ${this.getTranslation('startLongDivision')}${this.getPunctuation('period')}</p>`;
            }
        } else if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            // 根据当前演示步骤生成对应说明
            explanationText = this.generateStepExplanation(this.currentStep);
        } else if (this.currentStep === this.steps.length) {
            // 最终结果步骤
            explanationText = this.generateFinalResultExplanation();
        }
        
        this.explanationContent.innerHTML = explanationText;
    }
    
    generateStepExplanation(stepIndex) {
        const step = this.steps[stepIndex];
        const stepNum = stepIndex + 1;
        const absDivisor = Math.abs(this.divisor);
        const absDividend = Math.abs(this.dividend);
        const currentLang = getCurrentLanguage();
        const period = this.getPunctuation('period');
        const comma = this.getPunctuation('comma');
        
        // 分析当前步骤在演示中显示的内容
        let explanation = `<h3>${this.getTranslation('stepInfo')} ${stepNum}</h3>`;
        
        if (stepIndex === 0) {
            // 第一步：特殊处理商的第一位为0的情况
            if (step.quotientDigit === 0) {
                // 当商的第一位为0时，只简短说明，因为演示中没有显示乘积和减法
                explanation += `<p>${this.getTranslation('firstDigitSmaller')} ${step.workingNumber} ${this.getTranslation('smallerThanDivisor')} ${absDivisor}${this.getTranslation('cannotDivide')}${period} ${this.getTranslation('quotientFirstDigit')} 0${period}</p>`;
                return explanation;
            } else {
                // 正常的第一步计算
                explanation += `<p>${this.getTranslation('firstDigitSmaller')} ${step.workingNumber} >= ${absDivisor}${period}</p>`;
                explanation += `<p>${this.getTranslation('calculate')} ${step.workingNumber} ÷ ${absDivisor} ${this.getTranslation('equals')} ${step.quotientDigit}${this.getTranslation('writeInQuotient')} ${step.quotientDigit}${period}</p>`;
                
                // 添加乘积和减法说明
                explanation += `<p>${this.getTranslation('verify')} ${step.quotientDigit} ${this.getTranslation('multiply')} ${absDivisor} ${this.getTranslation('equals')} ${step.product}${this.getTranslation('writeProductBelow')} ${step.product} ${this.getTranslation('writeBelow')}${period}</p>`;
                explanation += `<p>${this.getTranslation('subtraction')} ${step.workingNumber} ${this.getTranslation('minus')} ${step.product} ${this.getTranslation('equals')} ${step.remainder}${this.getTranslation('getRemainder')} ${step.remainder}${period}</p>`;
            }
        } else {
            // 后续步骤：处理小数扩展和计算
            const prevStep = this.steps[stepIndex - 1];
            
            // 检查是否是开始小数计算的步骤（第二步）
            if (step.isDecimal && step.shouldShowDecimalInQuotient) {
                explanation += `<p><em>${this.getTranslation('noteDecimalStart')}</em></p>`;
                explanation += `<p>${this.getTranslation('addDecimalPlace')} ${absDividend} ${this.getTranslation('formNewDividend')} ${absDividend}.0${this.getTranslation('formNewDividendText')} ${step.workingNumber}${period}</p>`;
            } else if (step.isDecimal) {
                // 后续小数步骤：解释小数位的增加
                // 找到第一个小数步骤的索引
                let firstDecimalStepIndex = -1;
                for (let i = 0; i < this.steps.length; i++) {
                    if (this.steps[i].isDecimal && this.steps[i].shouldShowDecimalInQuotient) {
                        firstDecimalStepIndex = i;
                        break;
                    }
                }
                
                if (firstDecimalStepIndex !== -1) {
                    // 计算当前步骤相对于第一个小数步骤的位置
                    const decimalStepOffset = stepIndex - firstDecimalStepIndex;
                    const prevDecimalPlaces = decimalStepOffset; // 前一步的小数位数
                    const currentDecimalPlaces = decimalStepOffset + 1; // 当前步的小数位数
                    
                    // 构建前一步和当前步的被除数显示
                    const prevExtended = absDividend + '.' + '0'.repeat(prevDecimalPlaces);
                    const currentExtended = absDividend + '.' + '0'.repeat(currentDecimalPlaces);
                    
                    explanation += `<p>${this.getTranslation('extendDecimal')} ${prevExtended} ${this.getTranslation('addZeroBecome')} ${currentExtended}${period}</p>`;
                }
                
                // 标准的余数和带下数字说明
                if (prevStep.remainder !== undefined) {
                    explanation += `<p>${this.getTranslation('remainderFromPrevious')} ${prevStep.remainder}${this.getTranslation('bringDownDigit')} 0${this.getTranslation('formNewDividend')} ${step.workingNumber}${period}</p>`;
                }
            }
            
            // 标准的计算步骤说明
            explanation += `<p>${this.getTranslation('calculate')} ${step.workingNumber} ÷ ${absDivisor} ${this.getTranslation('equals')} ${step.quotientDigit}${this.getTranslation('writeInQuotient')} ${step.quotientDigit}${period}</p>`;
            explanation += `<p>${this.getTranslation('verify')} ${step.quotientDigit} ${this.getTranslation('multiply')} ${absDivisor} ${this.getTranslation('equals')} ${step.product}${this.getTranslation('writeProductBelow')} ${step.product} ${this.getTranslation('writeBelow')}${period}</p>`;
            explanation += `<p>${this.getTranslation('subtraction')} ${step.workingNumber} ${this.getTranslation('minus')} ${step.product} ${this.getTranslation('equals')} ${step.remainder}${this.getTranslation('getRemainder')} ${step.remainder}${period}</p>`;
        }
        
        return explanation;
    }
    
    getTranslation(key) {
        // 获取当前语言的翻译文本
        const currentLang = getCurrentLanguage();
        const langData = languages[currentLang];
        return langData ? langData.translations[key] : key;
    }

    getPunctuation(type) {
        const currentLang = getCurrentLanguage();
        const punctuation = {
            'zh-CN': {
                comma: '，',
                period: '。',
                quote: '"',
                colon: '：'
            },
            'en': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ': '
            },
            'de': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ': '
            },
            'fr': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ' : '
            },
            'ja': {
                comma: '、',
                period: '。',
                quote: '「',
                colon: '：'
            },
            'pt': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ': '
            },
            'ru': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ': '
            },
            'es': {
                comma: ', ',
                period: '.',
                quote: '"',
                colon: ': '
            }
        };
        
        return punctuation[currentLang] ? punctuation[currentLang][type] : punctuation['en'][type];
    }
    
    generateFinalResultExplanation() {
        const absDividend = Math.abs(this.dividend);
        const absDivisor = Math.abs(this.divisor);
        const hasNegative = this.dividend < 0 || this.divisor < 0;
        
        // 计算原始商（不四舍五入）
        const rawQuotient = absDividend / absDivisor;
        const extraDecimalPlace = this.decimals + 1;
        
        // 获取第N+1位小数数字
        const multiplier = Math.pow(10, extraDecimalPlace);
        const expandedQuotient = rawQuotient * multiplier;
        const lastDigit = Math.floor(expandedQuotient) % 10;
        
        // 四舍五入处理
        const roundedQuotient = parseFloat(rawQuotient.toFixed(this.decimals));
        const finalQuotient = hasNegative ? 
            ((this.dividend < 0) !== (this.divisor < 0) ? -roundedQuotient : roundedQuotient) : 
            roundedQuotient;
        
        let explanation = `<h3>${this.getTranslation('finalResultTitle')}</h3>`;
        
        // 为什么计算额外一位小数
        explanation += `<h4>${this.getTranslation('whyExtraDecimal')}</h4>`;
        explanation += `<p>${this.getTranslation('whyExtraDecimalText')
            .replace('{0}', extraDecimalPlace)
            .replace('{1}', this.decimals)}</p>`;
        
        // 四舍五入规则
        explanation += `<h4>${this.getTranslation('roundingRule')}</h4>`;
        const roundingCondition = lastDigit < 5 ? this.getTranslation('lessThanFive') : this.getTranslation('greaterEqualFive');
        const roundingAction = lastDigit < 5 ? this.getTranslation('keepSame') : this.getTranslation('roundUp');
        explanation += `<p>${this.getTranslation('roundingRuleText')
            .replace('{0}', extraDecimalPlace)
            .replace('{1}', lastDigit)
            .replace('{2}', roundingCondition)
            .replace('{3}', this.decimals)
            .replace('{4}', roundingAction)}</p>`;
        
        // 符号规则（如果有负数）
        if (hasNegative) {
            explanation += `<h4>${this.getTranslation('signRule')}</h4>`;
            let signDescription = '';
            let resultSign = '';
            
            if (this.dividend < 0 && this.divisor < 0) {
                signDescription = this.getTranslation('bothNegative');
                resultSign = this.getTranslation('resultPositive');
            } else if (this.dividend < 0) {
                signDescription = this.getTranslation('dividendNegative');
                resultSign = this.getTranslation('resultNegative');
            } else {
                signDescription = this.getTranslation('divisorNegative');
                resultSign = this.getTranslation('resultNegative');
            }
            
            explanation += `<p>${this.getTranslation('signRuleText')
                .replace('{0}', this.dividend)
                .replace('{1}', this.divisor)
                .replace('{2}', signDescription)
                .replace('{3}', resultSign)}</p>`;
        }
        
        // 最终答案
        explanation += `<h4>${this.getTranslation('finalAnswer')}</h4>`;
        explanation += `<p style="font-size: 1.2em; font-weight: bold; color: #007bff;">${finalQuotient}</p>`;
        
        return explanation;
    }
    
    calculateFinalQuotient() {
        // 计算最终商的值（包括符号处理）
        const absQuotient = Math.abs(this.dividend) / Math.abs(this.divisor);
        const isNegative = (this.dividend < 0) !== (this.divisor < 0);
        const quotient = isNegative ? -absQuotient : absQuotient;
        
        if (this.decimals > 0) {
            return quotient.toFixed(this.decimals);
        } else {
            return Math.floor(Math.abs(quotient)) * (isNegative ? -1 : 1);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例，用于语言切换时更新说明面板
    window.longDivisionDemo = new LongDivisionDemo();

    // 解析 URL 查询参数，支持别名，并在提供分子/分母时自动生成
    try {
        const params = new URLSearchParams(window.location.search);
        const numParam = params.get('numerator') ?? params.get('n') ?? params.get('dividend');
        const denParam = params.get('denominator') ?? params.get('d') ?? params.get('divisor');
        const decParam = params.get('decimals') ?? params.get('precision');

        const dividendInput = document.getElementById('dividend');
        const divisorInput = document.getElementById('divisor');
        const decimalsInput = document.getElementById('decimals');

        if (numParam != null && dividendInput) dividendInput.value = numParam;
        if (denParam != null && divisorInput) divisorInput.value = denParam;
        if (decParam != null && decimalsInput) decimalsInput.value = decParam;

        if (numParam != null && denParam != null && window.longDivisionDemo && typeof window.longDivisionDemo.generate === 'function') {
            window.longDivisionDemo.generate();
        }
    } catch (e) {
        // 忽略解析异常，保持页面正常加载
        console.warn('Query param parse error:', e);
    }
});
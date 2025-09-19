// 小数转分数演示工具
class DecimalToFractionDemo {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.decimal = '';
        this.isNegative = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateExplanation();
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generate());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());

        
        // 回车键触发生成
        document.getElementById('decimal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generate();
            }
        });
    }

    generate() {
        const decimalInput = document.getElementById('decimal').value.trim();
        
        if (!this.validateInput(decimalInput)) {
            return;
        }

        this.decimal = decimalInput;
        this.isNegative = decimalInput.startsWith('-');
        const absDecimal = this.isNegative ? decimalInput.substring(1) : decimalInput;
        
        this.steps = [];
        this.currentStep = 0;
        
        try {
            // 自动检测并转换
            this.autoDetectAndConvert(absDecimal);
            
            this.updateDisplay();
            this.updateButtons();
            this.updateExplanation();
            
        } catch (error) {
            this.showError(langManager.t('js_conversion_error') + error.message);
        }
    }

    validateInput(input) {
        if (!input) {
            this.showError(langManager.t('js_input_required'));
            return false;
        }

        // 移除负号进行验证
        const absInput = input.startsWith('-') ? input.substring(1) : input;
        
        // 检查不完整的括号
        const openParens = (absInput.match(/\(/g) || []).length;
        const closeParens = (absInput.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
            this.showError(langManager.t('js_incomplete_parentheses') || '括号不完整，请检查输入格式');
            return false;
        }
        
        // 检查是否有单独的左括号或右括号
        if (absInput.includes('(') && !absInput.includes(')')) {
            this.showError(langManager.t('js_incomplete_parentheses') || '括号不完整，请检查输入格式');
            return false;
        }
        
        if (absInput.includes(')') && !absInput.includes('(')) {
            this.showError(langManager.t('js_incomplete_parentheses') || '括号不完整，请检查输入格式');
            return false;
        }
        
        // 验证基本格式
        const patterns = [
            /^\d+\.\d+$/,                    // 有限小数：1.25
            /^\d+\.\d*\(\d+\)$/,            // 循环小数：0.1(23)
            /^\d+\.\d*\.{3}$/,              // 省略号：0.333...
            /^\d+$/                         // 整数：5
        ];
        
        const isValid = patterns.some(pattern => pattern.test(absInput));
        
        if (!isValid) {
            this.showError(langManager.t('js_invalid_format') || '输入格式无效，请检查格式');
            return false;
        }

        this.hideError();
        return true;
    }

    autoDetectAndConvert(decimal) {
        if (decimal.includes('(') || decimal.includes('...')) {
            this.convertRepeatingDecimal(decimal);
        } else if (decimal.includes('.')) {
            this.convertFiniteDecimal(decimal);
        } else {
            // 整数
            this.convertInteger(decimal);
        }
    }

    convertInteger(integer) {
        const num = parseInt(integer);
        this.steps = [
            {
                type: 'start',
                title: '整数转分数',
                content: `将整数 ${this.isNegative ? '-' : ''}${integer} 转换为分数形式`,
                fraction: { numerator: this.isNegative ? -num : num, denominator: 1 }
            },
            {
                type: 'result',
                title: '转换结果',
                content: `${this.isNegative ? '-' : ''}${integer} = ${this.isNegative ? '-' : ''}${integer}/1`,
                fraction: { numerator: this.isNegative ? -num : num, denominator: 1 }
            }
        ];
    }

    convertFiniteDecimal(decimal) {
        // 检测是否为循环小数，如果是则转到循环小数处理
        if (decimal.includes('(') || decimal.includes('...')) {
            this.convertRepeatingDecimal(decimal);
            return;
        }
        
        // 分离整数部分和小数部分
        const parts = decimal.split('.');
        const integerPart = parseInt(parts[0]) || 0;
        const decimalPart = parts[1] || '';
        const decimalPlaces = decimalPart.length;

        // 步骤一：分析小数结构
        this.steps.push({
            type: 'start',
            title: '分析小数结构',
            content: `分析有限小数 ${this.isNegative ? '-' : ''}${decimal} 的结构`,
            details: {
                integer: integerPart,
                decimal: decimalPart,
                places: decimalPlaces
            }
        });

        // 步骤二：转换为分数形式
        const denominator = Math.pow(10, decimalPlaces);
        const numeratorValue = parseInt(decimalPart) + integerPart * denominator;
        
        this.steps.push({
            type: 'analyze',
            title: '转换为分数形式',
            content: `将小数转换为分数形式`,
            details: {
                integer: integerPart,
                decimal: decimalPart,
                places: decimalPlaces
            },
            fraction: { 
                numerator: this.isNegative ? -numeratorValue : numeratorValue, 
                denominator: denominator 
            }
        });

        // 逐步化简分数
        this.addStepwiseSimplification(Math.abs(numeratorValue), denominator);

        this.steps.push({
            type: 'result',
            title: '得到最终结果',
            content: `${this.isNegative ? '-' : ''}${decimal} = ${this.getFinalFraction()}`,
            fraction: this.getFinalFractionObject()
        });
    }

    convertRepeatingDecimal(decimal) {
        // 步骤1：识别循环小数结构
        const structure = this.parseRepeatingDecimal(decimal);
        
        this.steps.push({
            type: 'start',
            title: '识别循环小数结构',
            content: `分析循环小数 ${this.isNegative ? '-' : ''}${decimal} 的结构`,
            details: {
                integerPart: structure.integerPart,
                nonRepeatingPart: structure.nonRepeatingPart,
                repeatingPart: structure.repeatingPart,
                nonRepeatingLength: structure.nonRepeatingLength,
                repeatingLength: structure.repeatingLength
            }
        });

        // 步骤2：设立方程
        this.steps.push({
            type: 'equation',
            title: '设立方程',
            content: `${langManager.t('js_let_x_equal')} ${this.isNegative ? '-' : ''}${decimal}`,
            equation: `x = ${this.isNegative ? '-' : ''}${decimal}`
        });

        // 步骤3：构造方程组
        const n = structure.nonRepeatingLength;
        const m = structure.repeatingLength;
        const multiplier1 = Math.pow(10, n + m);
        const multiplier2 = Math.pow(10, n);
        
        // 计算乘法后的值
        const equation1Value = this.calculateMultipliedValue(structure, multiplier1);
        const equation2Value = this.calculateMultipliedValue(structure, multiplier2);
        
        // 格式化为循环小数表示
        const equation1Display = this.formatAsRepeatingDecimal(equation1Value, structure, multiplier1);
        const equation2Display = this.formatAsRepeatingDecimal(equation2Value, structure, multiplier2);
        
        this.steps.push({
            type: 'multiply',
            title: '构造方程组',
            content: `根据循环小数的特点构造方程组`,
            equations: {
                equation1: `${multiplier1}x = ${this.isNegative ? '-' : ''}${equation1Display}`,
                equation2: `${multiplier2}x = ${this.isNegative ? '-' : ''}${equation2Display}`,
                multiplier1: multiplier1,
                multiplier2: multiplier2,
                value1: equation1Value,
                value2: equation2Value
            }
        });

        // 步骤4：消除循环部分（两式相减）
        const numeratorDiff = equation1Value - equation2Value;
        const denominatorDiff = multiplier1 - multiplier2;
        
        // 修复浮点数精度问题，对结果进行四舍五入
        const roundedNumeratorDiff = Math.round(numeratorDiff);
        
        this.steps.push({
            type: 'subtract',
            title: '消除循环部分',
            content: `两个方程相减，消除循环的小数部分`,
            calculation: {
                operation: `${multiplier1}x - ${multiplier2}x = ${this.isNegative ? '-' : ''}${equation1Display} - ${this.isNegative ? '-' : ''}${equation2Display}`,
                result: `${denominatorDiff}x = ${this.isNegative ? '-' : ''}${roundedNumeratorDiff}`,
                numerator: this.isNegative ? -roundedNumeratorDiff : roundedNumeratorDiff,
                denominator: denominatorDiff
            }
        });

        // 步骤5：求解分数
        this.steps.push({
            type: 'solve',
            title: '求解分数',
            content: `解方程得到分数形式`,
            fraction: {
                numerator: this.isNegative ? -roundedNumeratorDiff : roundedNumeratorDiff,
                denominator: denominatorDiff
            },
            equation: `x = ${this.isNegative ? '-' : ''}${roundedNumeratorDiff}/${denominatorDiff}`
        });

        // 步骤6：化简分数
        const gcd = this.findGCD(Math.abs(roundedNumeratorDiff), denominatorDiff);
        const finalNumerator = roundedNumeratorDiff / gcd;
        const finalDenominator = denominatorDiff / gcd;
        
        if (gcd > 1) {
            this.steps.push({
                type: 'simplify',
                title: '化简分数',
                content: `找到最大公约数进行化简`,
                details: {
                    gcd: gcd,
                    originalFraction: `${this.isNegative ? '-' : ''}${roundedNumeratorDiff}/${denominatorDiff}`,
                    simplifiedFraction: `${this.isNegative ? '-' : ''}${finalNumerator}/${finalDenominator}`
                },
                fraction: {
                    numerator: this.isNegative ? -finalNumerator : finalNumerator,
                    denominator: finalDenominator
                }
            });
        }

        // 步骤7：最终结果
        this.steps.push({
            type: 'result',
            title: '最终结果',
            content: `循环小数转换完成`,
            result: `${this.isNegative ? '-' : ''}${decimal} = ${this.isNegative ? '-' : ''}${finalNumerator}/${finalDenominator}`,
            fraction: {
                numerator: this.isNegative ? -finalNumerator : finalNumerator,
                denominator: finalDenominator
            }
        });
    }

    // 解析循环小数结构
    parseRepeatingDecimal(decimal) {
        let integerPart = 0;
        let nonRepeatingPart = '';
        let repeatingPart = '';
        
        if (decimal.includes('(')) {
            // 括号格式：0.1(23) 或 1.2(34)
            const match = decimal.match(/^(\d+)\.(\d*)\((\d+)\)$/);
            if (match) {
                integerPart = parseInt(match[1]);
                nonRepeatingPart = match[2] || '';
                repeatingPart = match[3];
            }
        } else if (decimal.includes('...')) {
            // 省略号格式：0.333... 或 1.2333...
            const beforeDots = decimal.replace('...', '');
            const parts = beforeDots.split('.');
            integerPart = parseInt(parts[0]);
            
            if (parts[1]) {
                const decimalPart = parts[1];
                // 对于省略号格式，需要识别循环模式
                // 检查是否有重复的数字模式
                let foundPattern = false;
                
                // 从最短的可能循环长度开始检查
                for (let patternLength = 1; patternLength <= Math.floor(decimalPart.length / 2); patternLength++) {
                    const pattern = decimalPart.slice(-patternLength);
                    let isRepeating = true;
                    
                    // 检查这个模式是否在小数部分中重复出现
                    for (let i = decimalPart.length - patternLength; i >= patternLength; i -= patternLength) {
                        const segment = decimalPart.slice(i - patternLength, i);
                        if (segment !== pattern) {
                            isRepeating = false;
                            break;
                        }
                    }
                    
                    if (isRepeating) {
                        // 找到循环模式
                        const repeatCount = Math.floor(decimalPart.length / patternLength);
                        const remainingLength = decimalPart.length % patternLength;
                        
                        if (remainingLength === 0 || decimalPart.slice(0, remainingLength) === pattern.slice(0, remainingLength)) {
                            nonRepeatingPart = '';
                            repeatingPart = pattern;
                            foundPattern = true;
                            break;
                        }
                    }
                }
                
                if (!foundPattern) {
                    // 如果没有找到明显的循环模式，假设最后一位是循环的
                    if (decimalPart.length > 1) {
                        nonRepeatingPart = decimalPart.slice(0, -1);
                        repeatingPart = decimalPart.slice(-1);
                    } else {
                        nonRepeatingPart = '';
                        repeatingPart = decimalPart;
                    }
                }
            }
        }
        
        return {
            integerPart: integerPart,
            nonRepeatingPart: nonRepeatingPart,
            repeatingPart: repeatingPart,
            nonRepeatingLength: nonRepeatingPart.length,
            repeatingLength: repeatingPart.length
        };
    }

    // 计算乘法后的精确值
    calculateMultipliedValue(structure, multiplier) {
        const { integerPart, nonRepeatingPart, repeatingPart } = structure;
        
        // 构造完整的小数值
        let decimalValue = integerPart;
        
        if (nonRepeatingPart) {
            decimalValue += parseInt(nonRepeatingPart) / Math.pow(10, nonRepeatingPart.length);
        }
        
        if (repeatingPart) {
            // 循环部分的值 - 使用更精确的计算
            const repeatingValue = parseInt(repeatingPart);
            const repeatingLength = repeatingPart.length;
            const repeatingDecimalValue = repeatingValue / (Math.pow(10, repeatingLength) - 1);
            const repeatingPosition = Math.pow(10, nonRepeatingPart.length);
            decimalValue += repeatingDecimalValue / repeatingPosition;
        }
        
        // 对于纯循环小数，使用精确的分数计算
        if (repeatingPart && nonRepeatingPart === '' && integerPart === 0) {
            const repeatingValue = parseInt(repeatingPart);
            const repeatingLength = repeatingPart.length;
            const numerator = multiplier * repeatingValue;
            const denominator = Math.pow(10, repeatingLength) - 1;
            
            // 返回精确的数值结果
            return numerator / denominator;
        }
        
        // 其他情况返回数值结果
        return decimalValue * multiplier;
    }

    findGCD(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // 逐步化简分数，每次除以10以内的公约数
    addStepwiseSimplification(numerator, denominator) {
        let currentNum = numerator;
        let currentDen = denominator;
        let simplificationSteps = [];
        
        // 找到所有化简步骤
        while (true) {
            let foundDivisor = false;
            
            // 从10开始向下查找公约数（优先除以较大的数）
            for (let divisor = 10; divisor >= 2; divisor--) {
                if (currentNum % divisor === 0 && currentDen % divisor === 0) {
                    simplificationSteps.push({
                        fromNum: currentNum,
                        fromDen: currentDen,
                        divisor: divisor,
                        toNum: currentNum / divisor,
                        toDen: currentDen / divisor
                    });
                    currentNum = currentNum / divisor;
                    currentDen = currentDen / divisor;
                    foundDivisor = true;
                    break;
                }
            }
            
            if (!foundDivisor) break;
        }
        
        // 无论是否有化简步骤，都添加到steps中
        this.steps.push({
            type: 'simplify',
            title: '化简分数',
            content: simplificationSteps.length > 0 ? '逐步化简分数到最简形式' : '检查是否可以化简',
            fraction: { 
                numerator: this.isNegative ? -currentNum : currentNum, 
                denominator: currentDen 
            },
            simplificationSteps: simplificationSteps,
            originalNumerator: numerator,
            originalDenominator: denominator
        });
    }

    getFinalFraction() {
        if (this.steps.length === 0) return '';
        
        const lastStep = this.steps[this.steps.length - 1];
        if (lastStep.fraction) {
            const { numerator, denominator } = lastStep.fraction;
            return `${numerator}/${denominator}`;
        }
        return '';
    }

    getFinalFractionObject() {
        if (this.steps.length === 0) return null;
        
        const lastStep = this.steps[this.steps.length - 1];
        return lastStep.fraction || null;
    }

    updateDisplay() {
        const display = document.getElementById('conversionDisplay');
        if (this.steps.length === 0) {
            display.innerHTML = `<p>${langManager.t('js_input_prompt')}</p>`;
            return;
        }

        const currentStepData = this.steps[this.currentStep];
        let html = `
            <div class="conversion-step">
                <div class="step-content">
        `;

        // 根据步骤类型显示不同内容 - 每个步骤显示累积的等式过程
        const cleanDecimal = this.decimal.replace('-', '');
        
        // 对于循环小数，显示累积的完整过程
        if (this.isRepeatingDecimal()) {
            html += this.buildCumulativeRepeatingDisplay();
        } else {
            // 有限小数的原有逻辑
            switch (currentStepData.type) {
                case 'start':
                    html += `
                        <div class="equation-display">
                            <div class="equation-step">
                                <span class="decimal-value">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">1</span>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                
            case 'analyze':
                // 步骤二：显示到转换过程的完整等式
                if (currentStepData.details) {
                    const { integer, decimal, places } = currentStepData.details;
                    const multiplier = Math.pow(10, places);
                    const numeratorValue = parseInt(decimal) + integer * multiplier;
                    
                    html += `
                        <div class="equation-display">
                            <div class="equation-step">
                                <span class="decimal-value">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">1</span>
                                </div>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${cleanDecimal} × ${multiplier}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">1 × ${multiplier}</span>
                                </div>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${numeratorValue}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">${multiplier}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'convert':
                // 显示转换结果（与analyze相同，这里可以跳过或显示相同内容）
                if (currentStepData.fraction) {
                    const { numerator, denominator } = currentStepData.fraction;
                    html += `
                        <div class="fraction-display">
                            <div class="fraction">
                                <span class="numerator">${numerator}</span>
                                <span class="fraction-line"></span>
                                <span class="denominator">${denominator}</span>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'simplify':
                // 步骤三：显示逐步化简的完整等式
                if (currentStepData.fraction && currentStepData.simplificationSteps) {
                    const { numerator, denominator } = currentStepData.fraction;
                    const steps = currentStepData.simplificationSteps;
                    
                    // 获取原始分子分母（化简前的值）
                    const decimalPlaces = cleanDecimal.split('.')[1].length;
                    const multiplier = Math.pow(10, decimalPlaces);
                    const originalNum = Math.abs(parseInt(cleanDecimal.replace('.', '')));
                    const originalDen = multiplier;
                    
                    html += `
                        <div class="equation-display">
                            <div class="equation-step">
                                <span class="decimal-value">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">1</span>
                                </div>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${cleanDecimal} × ${multiplier}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">1 × ${multiplier}</span>
                                </div>
                                <span class="equals">=</span>
                                <div class="fraction">
                                    <span class="numerator">${this.isNegative ? '-' : ''}${originalNum}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">${originalDen}</span>
                                </div>
                    `;
                    
                    // 添加逐步化简过程
                    steps.forEach(step => {
                        html += `
                            <span class="equals">=</span>
                            <div class="fraction">
                                <span class="numerator">${this.isNegative ? '-' : ''}${step.fromNum}÷${step.divisor}</span>
                                <span class="fraction-line"></span>
                                <span class="denominator">${step.fromDen}÷${step.divisor}</span>
                            </div>
                            <span class="equals">=</span>
                            <div class="fraction">
                                <span class="numerator">${this.isNegative ? '-' : ''}${step.toNum}</span>
                                <span class="fraction-line"></span>
                                <span class="denominator">${step.toDen}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'result':
                // 步骤四：只显示简洁的最终结果
                if (currentStepData.fraction) {
                    const { numerator, denominator } = currentStepData.fraction;
                    
                    html += `
                        <div class="equation-display">
                            <div class="equation-step">
                                <span class="decimal-value">${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                                <span class="equals">=</span>
                                <div class="fraction final-result">
                                    <span class="numerator">${numerator}</span>
                                    <span class="fraction-line"></span>
                                    <span class="denominator">${denominator}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'subtract':
                // 显示计算过程
                if (currentStepData.calculation) {
                    const { numerator, denominator } = currentStepData.calculation;
                    html += `
                        <div class="fraction-display">
                            <div class="fraction">
                                <span class="numerator">${numerator}</span>
                                <span class="fraction-line"></span>
                                <span class="denominator">${denominator}</span>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'equation':
                // 步骤2：设立方程
                html += `
                    <div class="equation-display">
                        <div class="equation-step">
                            <span class="equation-text">${langManager.t('js_let_x_equal')} ${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                        </div>
                    </div>
                `;
                break;
                
            case 'multiply':
                // 步骤3：构造方程组
                if (currentStepData.equations) {
                    const { equation1, equation2 } = currentStepData.equations;
                    html += `
                        <div class="equation-display">
                            <div class="equation-step">
                                <div class="equation-line">${equation1}</div>
                                <div class="equation-line">${equation2}</div>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'algebra':
                // 其他代数步骤
                html += `<p class="main-content">${currentStepData.content}</p>`;
                break;
                
            default:
                html += `<p class="main-content">${currentStepData.content}</p>`;
            }
        }

        html += `
                </div>
            </div>
        `;

        display.innerHTML = html;
    }

    updateExplanation() {
        const explanationContent = document.getElementById('explanationContent');
        
        if (this.steps.length === 0) {
            explanationContent.innerHTML = `
                <h3>${langManager.t('js_operation_guide')}</h3>
                <p>${langManager.t('js_input_guide')}</p>
                <h4>${langManager.t('js_supported_formats')}</h4>
                <ul>
                    <li>${langManager.t('js_finite_decimal')}</li>
                    <li>${langManager.t('js_repeating_parentheses')}</li>
                    <li>${langManager.t('js_repeating_ellipsis')}</li>
                </ul>
            `;
            return;
        }

        const currentStepData = this.steps[this.currentStep];
        let explanation = `
            <div class="step-counter">${langManager.t('js_step_counter')} ${this.currentStep + 1}</div>
        `;
        
        // 根据步骤类型显示简洁的说明
        switch (currentStepData.type) {
            case 'start':
                // 检查是否为循环小数
                if (currentStepData.details && currentStepData.details.repeatingPart) {
                    // 循环小数的说明
                    explanation += `<p>${langManager.t('js_analyze_structure')}</p>`;
                    explanation += `
                        <div style="margin-top: 15px;">
                            <p><strong>${langManager.t('js_non_repeating_part')}</strong></p>
                            <p><strong>${langManager.t('js_repeating_part')}</strong></p>
                            <p><strong>${langManager.t('js_repeating_length')}</strong></p>
                        </div>
                    `;
                } else {
                    // 有限小数的说明
                    explanation += `<p>${langManager.t('js_analyze_structure')}</p>`;
                    if (currentStepData.details) {
                        const { integer, decimal, places } = currentStepData.details;
                        const cleanDecimal = this.decimal.replace('-', '');
                        explanation += `
                            <div style="margin-top: 15px;">
                                <p><strong>${this.isNegative ? '-' : ''}${cleanDecimal}${langManager.t('js_finite_decimal_type')}</strong></p>
                                <p><strong>${langManager.t('js_integer_part')}:</strong> ${integer}</p>
                                <p><strong>${langManager.t('js_decimal_part')}:</strong> ${decimal}</p>
                                <p><strong>${langManager.t('js_decimal_places')}:</strong> ${places}</p>
                            </div>
                        `;
                    }
                }
                break;
            case 'analyze':
                explanation += `<p>${langManager.t('js_convert_to_fraction')}</p>`;
                // 显示详细的转换逻辑说明
                if (currentStepData.details) {
                    const { integer, decimal, places } = currentStepData.details;
                    const cleanDecimal = this.decimal.replace('-', '');
                    const multiplier = Math.pow(10, places);
                    const numeratorValue = parseInt(decimal) + integer * multiplier;
                    
                    explanation += `
                        <div style="margin-top: 15px;">
                            <p><strong>${langManager.t('js_numerator_explanation')}</strong>${this.isNegative ? '-' : ''}${langManager.t('js_decimal_places_explanation')
                                .replace('{decimal}', cleanDecimal)
                                .replace('{places}', places)
                                .replace('{decimal}', cleanDecimal)
                                .replace('{multiplier}', multiplier)
                                .replace('{numerator}', numeratorValue)}</p>
                            <p><strong>${langManager.t('js_denominator_explanation')}</strong>${langManager.t('js_maintain_value_explanation')
                                .replace('{multiplier}', multiplier)
                                .replace('{multiplier}', multiplier)}</p>
                            <p><strong>${this.isNegative ? '-' : ''}${cleanDecimal} --> ${this.isNegative ? '-' : ''}${numeratorValue}/${multiplier}</strong></p>
                        </div>
                    `;
                }
                break;
            case 'convert':
                explanation += `<p>${langManager.t('js_convert_to_fraction')}</p>`;
                break;
            case 'equation':
                explanation += `<p>${langManager.t('js_equation_setup')}</p>`;
                break;
            case 'multiply':
                explanation += `<p>${langManager.t('js_multiply_equations')}</p>`;
                if (currentStepData.equations) {
                    explanation += `
                        <div style="margin-top: 15px;">
                            <p>· ${langManager.t('js_multiply_explanation1')}</p>
                            <p>· ${langManager.t('js_multiply_explanation2')}</p>
                        </div>
                    `;
                }
                break;
            case 'algebra':
                explanation += '<p>设立代数方程</p>';
                break;
            case 'subtract':
                explanation += `<p>${langManager.t('js_subtract_equations')}</p>`;
                break;
            case 'solve':
                explanation += `<p>${langManager.t('js_solve_fraction')}</p>`;
                // 动态计算除数
                if (this.isRepeatingDecimal() && this.steps.length > 3 && this.steps[3].calculation) {
                    const denominator = this.steps[3].calculation.denominator;
                    explanation += `
                        <div style="margin-top: 15px;">
                            <p>${langManager.t('js_solve_explanation')}</p>
                        </div>
                    `;
                } else {
                    explanation += `
                        <div style="margin-top: 15px;">
                            <p>${langManager.t('js_solve_explanation')}</p>
                        </div>
                    `;
                }
                break;
            case 'simplify':
                explanation += `<p>${langManager.t('js_simplify_fraction')}</p>`;
                // 动态显示实际的最大公约数计算过程
                if (this.isRepeatingDecimal() && currentStepData.details) {
                    const { gcd } = currentStepData.details;
                    // 查找原始分数
                    let originalNumerator, originalDenominator;
                    
                    // 从前一个步骤（求解步骤）获取原始分数
                    for (let i = this.currentStep - 1; i >= 0; i--) {
                        if (this.steps[i].fraction) {
                            originalNumerator = Math.abs(this.steps[i].fraction.numerator);
                            originalDenominator = this.steps[i].fraction.denominator;
                            break;
                        }
                    }
                    
                    if (originalNumerator && originalDenominator && gcd > 1) {
                        const simplifiedNumerator = originalNumerator / gcd;
                        const simplifiedDenominator = originalDenominator / gcd;
                        
                        explanation += `
                            <div style="margin-top: 15px;">
                                <p>${originalNumerator} = ${simplifiedNumerator} ✖️ ${gcd}</p>
                                <p>${originalDenominator} = ${simplifiedDenominator} ✖️ ${gcd}</p>
                                <p>${langManager.t('js_gcd_calculation_generic')} = ${gcd}</p>
                            </div>
                        `;
                    } else {
                        // 如果无法获取动态数据，使用原来的硬编码逻辑
                        explanation += `
                            <div style="margin-top: 15px;">
                                <p>3 = 3 ✖️ 1</p>
                                <p>9 = 3 ✖️ 3</p>
                                <p>${langManager.t('js_gcd_calculation')}</p>
                            </div>
                        `;
                    }
                } else {
                    // 有限小数的原有逻辑
                    if (currentStepData.simplificationSteps && currentStepData.simplificationSteps.length > 0) {
                        const steps = currentStepData.simplificationSteps;
                        explanation += `
                            <div style="margin-top: 15px;">
                                <p><strong>${langManager.t('js_step_by_step_process')}</strong></p>
                        `;
                        
                        steps.forEach((step, index) => {
                            explanation += `
                                <p>${langManager.t('js_step_divisible')
                                    .replace('{step}', index + 1)
                                    .replace('{num}', step.fromNum)
                                    .replace('{den}', step.fromDen)
                                    .replace('{divisor}', step.divisor)
                                    .replace('{result_num}', step.toNum)
                                    .replace('{result_den}', step.toDen)}</p>
                            `;
                        });
                        
                        explanation += `
                                <p><strong>${langManager.t('js_explanation')}：</strong>${langManager.t('js_simplify_explanation')}</p>
                            </div>
                        `;
                    } else if (currentStepData.originalNumerator && currentStepData.originalDenominator) {
                        // 当无法化简时显示说明
                        const cleanDecimal = this.decimal.replace('-', '');
                        const { numerator, denominator } = currentStepData.fraction;
                        explanation += `
                            <div style="margin-top: 15px;">
                                <p><strong>${langManager.t('js_gcd_result')
                                    .replace('{num1}', currentStepData.originalNumerator)
                                    .replace('{num2}', currentStepData.originalDenominator)
                                    .replace('{gcd_text}', langManager.t('js_gcd_calculation_generic'))
                                    .replace('{cannot_simplify}', langManager.t('js_cannot_simplify'))}</strong></p>
                            </div>
                        `;
                    }
                }
                break;
            case 'result':
                explanation += `<p>${langManager.t('js_final_result')}</p>`;
                break;
        }

        explanationContent.innerHTML = explanation;
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateDisplay();
            this.updateButtons();
            this.updateExplanation();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
            this.updateButtons();
            this.updateExplanation();
        }
    }

    updateButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        if (this.steps.length === 0) {
            nextBtn.disabled = true;
            prevBtn.disabled = true;
        } else {
            nextBtn.disabled = this.currentStep >= this.steps.length - 1;
            prevBtn.disabled = this.currentStep <= 0;
        }
    }

    restart() {
        this.steps = [];
        this.currentStep = 0;
        this.decimal = '';
        this.isNegative = false;
        
        document.getElementById('decimal').value = '';
        document.getElementById('method').value = 'auto';
        
        this.updateDisplay();
        this.updateButtons();
        this.updateExplanation();
        this.hideError();
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.style.display = 'none';
    }

    // 检查是否为循环小数
    isRepeatingDecimal() {
        const cleanDecimal = this.decimal.replace('-', '');
        return cleanDecimal.includes('(') || cleanDecimal.includes('...');
    }

    // 构建循环小数的累积显示内容
    buildCumulativeRepeatingDisplay() {

        
        const cleanDecimal = this.decimal.replace('-', '');
        let html = '';
        
        // 转换为标准的省略号格式显示
        let standardFormat = cleanDecimal;
        if (cleanDecimal.includes('(')) {
            const match = cleanDecimal.match(/^(\d+)\.(\d*)\((\d+)\)$/);
            if (match) {
                const integerPart = match[1];
                const nonRepeating = match[2] || '';
                const repeating = match[3];
                standardFormat = `${integerPart}.${nonRepeating}${repeating}${repeating}${repeating}...`;
            }
        }
        
        const currentStepData = this.steps[this.currentStep];
        
        switch (this.currentStep) {
            case 0: // 步骤1：显示原始格式和结构分析
                if (currentStepData.details) {
                    const { nonRepeatingPart, repeatingPart, repeatingLength } = currentStepData.details;
                    html += `
                        <div class="repeating-analysis">
                            <div class="conversion-line">
                                <span>${this.isNegative ? '-' : ''}${cleanDecimal}</span>
                            </div>
                            <div class="structure-analysis">
                                <div>${langManager.t('js_non_repeating_part_label')}${nonRepeatingPart || '0'}</div>
                                <div>${langManager.t('js_repeating_part_label')}${repeatingPart}</div>
                                <div>${langManager.t('js_repeating_length_label')}${repeatingLength}</div>
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 1: // 步骤2：设立方程（保持原始格式）
                html += `
                    <div class="equation-process">
                        <div class="equation-line">${langManager.t('js_let_x_equal')} ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                    </div>
                `;
                break;
                
            case 2: // 步骤3：构造方程组（保持原始格式）
                if (currentStepData.equations) {
                    const { equation1, equation2 } = currentStepData.equations;
                    html += `
                        <div class="equation-process">
                            <div class="equation-line">${langManager.t('js_let_x_equal')} ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                            <div class="equation-line">${equation1}</div>
                            <div class="equation-line">${equation2}</div>
                        </div>
                    `;
                }
                break;
                
            case 3: // 步骤4：两式相减
                if (currentStepData.calculation && this.steps[2].equations) {
                    const { equation1, equation2, value1, value2 } = this.steps[2].equations;
                    const { operation, result } = currentStepData.calculation;
                    
                    html += `
                        <div class="equation-process">
                            <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                            <div class="equation-line">${equation1}</div>
                            <div class="equation-line">${equation2}</div>
                            <div class="separator">↓</div>
                            <div class="equation-line">${operation}</div>
                            <div class="equation-line">${result}</div>
                        </div>
                    `;
                }
                break;
                
            case 4: // 步骤5：求解分数
                if (currentStepData.fraction && this.steps[3].calculation && this.steps[2].equations) {
                    const { numerator, denominator } = currentStepData.fraction;
                    const { equation1, equation2 } = this.steps[2].equations;
                    const { operation, result } = this.steps[3].calculation;
                    
                    html += `
                        <div class="equation-process">
                            <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                            <div class="equation-line">${equation1}</div>
                            <div class="equation-line">${equation2}</div>
                            <div class="separator">↓</div>
                            <div class="equation-line">${operation}</div>
                            <div class="equation-line">${result}</div>
                            <div class="equation-line">x = ${numerator}/${denominator}</div>
                        </div>
                    `;
                }
                break;
                
            case 5: // 步骤6：化简分数或最终结果

                
                if (currentStepData.details && this.steps[4].fraction && this.steps[3].calculation && this.steps[2].equations) {
                    // 有化简步骤 - 只显示化简过程，不显示最终答案
                    const originalFraction = this.steps[4].fraction;
                    const { gcd, simplifiedFraction } = currentStepData.details;
                    const { equation1, equation2 } = this.steps[2].equations;
                    const { operation, result } = this.steps[3].calculation;
                    
                    html += `
                        <div class="equation-process">
                            <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                            <div class="equation-line">${equation1}</div>
                            <div class="equation-line">${equation2}</div>
                            <div class="separator">↓</div>
                            <div class="equation-line">${operation}</div>
                            <div class="equation-line">${result}</div>
                            <div class="equation-line">x = ${originalFraction.numerator}/${originalFraction.denominator}${simplifiedFraction === '1' ? ' = 1' : `=${Math.abs(originalFraction.numerator)}÷${gcd}/${originalFraction.denominator}÷${gcd} = ${simplifiedFraction}`}</div>
                        </div>
                    `;
                } else if (currentStepData.type === 'result' && this.steps[4] && this.steps[3].calculation && this.steps[2].equations) {
                    // 最终结果步骤（无化简）
                    const solveFraction = this.steps[4].fraction;
                    const { equation1, equation2 } = this.steps[2].equations;
                    const { operation, result } = this.steps[3].calculation;
                    const finalResult = `${Math.abs(solveFraction.numerator)}/${solveFraction.denominator}`;
                    
                    html += `
                        <div class="equation-process">
                            <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                            <div class="equation-line">${equation1}</div>
                            <div class="equation-line">${equation2}</div>
                            <div class="separator">↓</div>
                            <div class="equation-line">${operation}</div>
                            <div class="equation-line">${result}</div>
                            <div class="equation-line">x = ${solveFraction.numerator}/${solveFraction.denominator}</div>
                            <div class="final-result">${this.isNegative ? '-' : ''}${cleanDecimal} = ${this.isNegative ? '-' : ''}${finalResult}</div>
                        </div>
                    `;
                }
                break;
                
            case 6: // 最终结果步骤


                
                // 动态查找求解步骤和方程步骤
                let solveStepIndex = -1;
                let equationStepIndex = -1;
                let calculationStepIndex = -1;
                
                // 查找各个步骤的索引
                for (let i = 0; i < this.steps.length; i++) {
                    if (this.steps[i].equations) {
                        equationStepIndex = i;
                    }
                    if (this.steps[i].calculation) {
                        calculationStepIndex = i;
                    }
                    if (this.steps[i].fraction && this.steps[i].type !== 'result') {
                        solveStepIndex = i;
                    }
                }
                

                
                if (solveStepIndex >= 0 && equationStepIndex >= 0 && calculationStepIndex >= 0) {
                    const { equation1, equation2 } = this.steps[equationStepIndex].equations;
                    const { operation, result } = this.steps[calculationStepIndex].calculation;
                    const solveFraction = this.steps[solveStepIndex].fraction;
                    

                    
                    // 检查是否有化简步骤（查找type为'simplify'的步骤）
                    let simplifyStepIndex = -1;
                    for (let i = solveStepIndex + 1; i < this.steps.length; i++) {
                        if (this.steps[i].details && this.steps[i].type === 'simplify') {
                            simplifyStepIndex = i;
                            break;
                        }
                    }
                    

                    
                    if (simplifyStepIndex >= 0) {
                        // 有化简步骤
                        const { gcd, simplifiedFraction } = this.steps[simplifyStepIndex].details;
                        html += `
                            <div class="equation-process">
                                <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                                <div class="equation-line">${equation1}</div>
                                <div class="equation-line">${equation2}</div>
                                <div class="separator">↓</div>
                                <div class="equation-line">${operation}</div>
                                <div class="equation-line">${result}</div>
                                <div class="equation-line">x = ${solveFraction.numerator}/${solveFraction.denominator}${simplifiedFraction === '1' ? ' = 1' : `=${Math.abs(solveFraction.numerator)}÷${gcd}/${solveFraction.denominator}÷${gcd} = ${simplifiedFraction}`}</div>
                                <div class="final-result">${this.isNegative ? '-' : ''}${cleanDecimal} = ${simplifiedFraction}</div>
                            </div>
                        `;
                    } else {
                        // 没有化简步骤，直接显示最终结果
                        const finalResult = `${Math.abs(solveFraction.numerator)}/${solveFraction.denominator}`;
                        html += `
                            <div class="equation-process">
                                <div class="equation-line">${langManager.t('js_let_x_equal')}  ${this.isNegative ? '-' : ''}${cleanDecimal}</div>
                                <div class="equation-line">${equation1}</div>
                                <div class="equation-line">${equation2}</div>
                                <div class="separator">↓</div>
                                <div class="equation-line">${operation}</div>
                                <div class="equation-line">${result}</div>
                                <div class="equation-line">x = ${solveFraction.numerator}/${solveFraction.denominator}</div>
                                <div class="final-result">${this.isNegative ? '-' : ''}${cleanDecimal} = ${this.isNegative ? '-' : ''}${finalResult}</div>
                            </div>
                        `;
                    }
                } else {

                }
                break;
        }
        
        return html;
    }

    // 将浮点数结果格式化为循环小数表示
    formatAsRepeatingDecimal(value, structure, multiplier) {
        const { integerPart, nonRepeatingPart, repeatingPart } = structure;
        
        // 对于纯循环小数（如0.(3)或1.(23)），计算乘法后的循环小数表示
        if (repeatingPart && nonRepeatingPart === '') {
            const repeatingValue = parseInt(repeatingPart);
            const repeatingLength = repeatingPart.length;
            
            // 特殊处理.(9)的情况
            if (repeatingPart === '9') {
                if (multiplier === 1) {
                    return `${integerPart}.(9)`;
                } else {
                    // 对于n.(9) × m，结果是(n*m + m-1).(9)
                    const result = integerPart * multiplier + multiplier - 1;
                    return `${result}.(9)`;
                }
            }
            
            // 计算原始小数的分数表示：integerPart + repeatingValue/(10^repeatingLength - 1)
            const originalFraction = integerPart + repeatingValue / (Math.pow(10, repeatingLength) - 1);
            const multipliedValue = originalFraction * multiplier;
            const resultIntegerPart = Math.floor(multipliedValue);
            const fractionalPart = multipliedValue - resultIntegerPart;
            
            // 检查小数部分是否接近0（即结果是整数）
            if (Math.abs(fractionalPart) < 1e-10) {
                return resultIntegerPart.toString();
            } else {
                // 构造循环小数表示，循环部分保持不变
                return `${resultIntegerPart}.(${repeatingPart})`;
            }
        }
        
        // 对于混合循环小数（如0.123(45)），计算乘法后的循环小数表示
        if (repeatingPart && nonRepeatingPart !== '') {
            // 构造原始小数的分数表示
            const nonRepValue = nonRepeatingPart ? parseInt(nonRepeatingPart) : 0;
            const repValue = parseInt(repeatingPart);
            const nonRepLength = nonRepeatingPart.length;
            const repLength = repeatingPart.length;
            
            // 计算乘法后的结果
            // 对于0.444(5) × 10000 = 4444.(5)
            // 对于0.444(5) × 1000 = 444.(5)
            
            // 计算整数部分
            const originalFraction = (nonRepValue * (Math.pow(10, repLength) - 1) + repValue) / 
                                   (Math.pow(10, nonRepLength) * (Math.pow(10, repLength) - 1));
            const multipliedValue = (integerPart + originalFraction) * multiplier;
            const resultIntegerPart = Math.floor(multipliedValue);
            
            // 计算小数部分
            const fractionalPart = multipliedValue - resultIntegerPart;
            
            // 构造循环小数表示
            if (Math.abs(fractionalPart) < 1e-10) {
                return resultIntegerPart.toString();
            } else {
                // 对于混合循环小数，乘法后的循环部分保持不变
                return `${resultIntegerPart}.(${repeatingPart})`;
            }
        }
        
        // 其他情况返回原值
        return value.toString();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.decimalToFractionDemo = new DecimalToFractionDemo();
});
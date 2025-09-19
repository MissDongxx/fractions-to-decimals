class MathToolsNavigation {
    constructor() {
        this.currentTool = '';
        this.toolInstances = {};
        this.initializeNavigation();
        this.loadInitialTool();
    }

    initializeNavigation() {
        // 使用事件委托绑定点击，避免子元素问题，且支持未来动态按钮
        const tabsContainer = document.querySelector('.tool-tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest && e.target.closest('.tab-btn');
                if (btn && tabsContainer.contains(btn)) {
                    const toolName = btn.getAttribute('data-tool');
                    if (toolName) {
                        this.switchTool(toolName);
                    }
                }
            });
        }

        // 监听浏览器前进后退
        window.addEventListener('popstate', () => {
            const toolName = this.getToolFromURL();
            this.switchTool(toolName, false);
        });
    }

    // 防止并发加载造成的错乱
    _loadingToken = 0;

    async switchTool(toolName, updateURL = true) {
        if (!toolName) return;

        const isSame = toolName === this.currentTool;

        // 1. 立即更新高亮，提供即时反馈
        this.updateTabState(toolName);

        // 2. 更新状态和URL
        this.currentTool = toolName;
        if (updateURL) {
            const newURL = toolName === 'fraction-to-decimal'
                ? window.location.pathname
                : `${window.location.pathname}#${toolName}`;
            const currentFull = window.location.pathname + window.location.hash;
            if (newURL !== currentFull) {
                history.pushState({ tool: toolName }, '', newURL);
            }
        }

        // 3. 如果是相同工具，则不重新加载内容，但高亮已确保
        if (isSame) return;

        // 4. 加载新内容
        const token = ++this._loadingToken;
        await this.loadTool(toolName);
        if (token !== this._loadingToken) return;

        // 5. 加载完成后，再次强制设置高亮，作为最终保险，确保状态正确
        this.updateTabState(toolName);
    }

    updateTabState(toolName) {
        // 直接操作DOM，强制设置高亮状态

        
        try {
            // 移除所有active状态
            const allTabs = document.querySelectorAll('.tab-btn');

            
            allTabs.forEach(btn => {
                // 移除类和属性
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                btn.setAttribute('tabindex', '-1');
                
                // 重要：清除所有可能的内联样式
                btn.style.removeProperty('background-color');
                btn.style.removeProperty('color');
                btn.style.removeProperty('font-weight');
                // 完全重置样式以确保一致性
                btn.removeAttribute('style');
            });

            // 添加新的active状态
            const activeBtn = document.querySelector(`.tab-btn[data-tool="${toolName}"]`);

            
            if (activeBtn) {
                // 强制设置样式，确保高亮显示
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-selected', 'true');
                activeBtn.setAttribute('tabindex', '0');
            }
        } catch (err) {
            console.error('设置高亮出错:', err);
        }
    }

    async loadTool(toolName) {
        const toolContent = document.getElementById('toolContent');
        
        try {
            // 显示加载状态
            toolContent.innerHTML = '<div class="loading">加载中...</div>';

            // 获取工具HTML内容
            const response = await fetch(`${toolName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${toolName}.html`);
            }

            const html = await response.text();
            
            // 解析HTML文档
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 加载CSS样式
            await this.loadToolStyles(doc, toolName);
            
            // 提取body内容
            const bodyContent = doc.body.innerHTML;

            // 插入内容
            toolContent.innerHTML = bodyContent;

            // 重新初始化工具的JavaScript逻辑
            await this.initializeToolScript(toolName);

            // 重新应用多语言
            if (window.updateLanguage) {
                window.updateLanguage();
            }
        } catch (error) {
            console.error('Error loading tool:', error);
            toolContent.innerHTML = `
                <div class="error-message">
                    <h3>加载失败</h3>
                    <p>无法加载 ${toolName} 工具，请刷新页面重试。错误: ${error.message}</p>
                </div>
            `;
        }
    }

    async loadToolStyles(doc, toolName) {
        // 获取工具页面中的CSS链接
        const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
        
        for (const link of linkElements) {
            const href = link.getAttribute('href');
            
            // 检查是否已经加载过这个样式文件
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (!existingLink && href) {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href;
                newLink.setAttribute('data-tool', toolName);
                document.head.appendChild(newLink);
                
                // 等待样式加载完成
                await new Promise((resolve) => {
                    newLink.onload = resolve;
                    newLink.onerror = resolve; // 即使加载失败也继续
                });
            }
        }
    }

    async initializeToolScript(toolName) {
        // 清理之前的工具实例和全局变量
        if (this.toolInstances[this.currentTool]) {
            // 如果有清理方法，调用它
            if (typeof this.toolInstances[this.currentTool].destroy === 'function') {
                this.toolInstances[this.currentTool].destroy();
            }
        }
        
        // 清理全局变量
        if (window.longDivisionDemo) {
            window.longDivisionDemo = null;
        }
        if (window.decimalToFractionDemo) {
            window.decimalToFractionDemo = null;
        }

        // 检查脚本是否已经加载
        const existingScript = document.querySelector(`script[data-tool="${toolName}"]`);
        if (!existingScript) {
            // 动态加载对应的JavaScript文件
            try {
                // 创建新的script标签
                const script = document.createElement('script');
                script.src = `${toolName}.js`;
                script.setAttribute('data-tool', toolName);
                
                // 等待脚本加载完成
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });

            } catch (error) {
                console.error(`Error loading script for ${toolName}:`, error);
                return;
            }
        }

        // 初始化工具实例
        this.initializeToolInstance(toolName);
    }

    initializeToolInstance(toolName) {
        // 根据工具名称初始化对应的实例
        switch (toolName) {
            case 'fraction-to-decimal':
                if (typeof LongDivisionDemo !== 'undefined') {
                    this.toolInstances[toolName] = new LongDivisionDemo();
                    // 设置全局变量，供语言切换时使用
                    window.longDivisionDemo = this.toolInstances[toolName];
                }
                break;
            case 'decimal-to-fraction':
                if (typeof DecimalToFractionDemo !== 'undefined') {
                    this.toolInstances[toolName] = new DecimalToFractionDemo();
                    // 设置全局变量，供语言切换时使用
                    window.decimalToFractionDemo = this.toolInstances[toolName];
                }
                break;
        }
    }

    getToolFromURL() {
        // 从URL hash中获取工具名称
        const hash = window.location.hash.substring(1);
        
        // 支持的工具列表
        const supportedTools = ['fraction-to-decimal', 'decimal-to-fraction'];
        
        // 如果hash中包含支持的工具名称，返回该工具
        if (supportedTools.includes(hash)) {
            return hash;
        }
        
        // 默认返回分数转小数工具
        return 'fraction-to-decimal';
    }

    async loadInitialTool() {
        const toolName = this.getToolFromURL();
        await this.switchTool(toolName, false);
    }
}

// 页面加载完成后初始化导航
document.addEventListener('DOMContentLoaded', () => {
    window.mathToolsNavigation = new MathToolsNavigation();
});

// 添加加载样式
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
        font-size: 18px;
        color: #6b7280;
    }

    .error-message {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 400px;
        text-align: center;
        color: #ef4444;
    }

    .error-message h3 {
        margin-bottom: 10px;
        font-size: 20px;
    }

    .error-message p {
        color: #6b7280;
        font-size: 16px;
    }
`;
document.head.appendChild(loadingStyle);
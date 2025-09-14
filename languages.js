// 多语言数据配置
const languages = {
    'zh-CN': {
        name: '简体中文',
        flag: '🇨🇳',
        translations: {
            title: '交互式长除法演示工具',
            subtitle: '通过动画学习长除法的每一个步骤',
            dividend: '被除数',
            divisor: '除数',
            decimals: '小数位数',
            generate: '生成',
            nextStep: '下一步',
            prevStep: '上一步',
            restart: '重新开始',
            dividendPlaceholder: '输入被除数',
            divisorPlaceholder: '输入除数',
            decimalsPlaceholder: '小数位数 (0-12)',
            errorDivisorZero: '除数不能为零！',
            errorInvalidInput: '请输入有效的数字！',
            errorDecimalRange: '小数位数必须在0-12之间！',
            stepInfo: '步骤',
            quotient: '商',
            remainder: '余数',
            product: '乘积',
            // 教学内容翻译
            whatIsLongDivision: '什么是长除法？',
            longDivisionDesc1: '长除法是一种逐步进行的除法计算方法，通常用于大数或小数的运算。它通过"商、余数、减法"的反复操作，让学生逐步理解除法的逻辑，而不是单纯背诵口诀。',
            longDivisionDesc2: '在小学数学学习中，长除法是进阶的重要环节，为分数运算、小数运算以及代数打下基础。',
            toolFeatures: '工具特色',
            feature1: '逐步演示长除法的完整计算过程',
            feature2: '支持整数与小数除法',
            feature3: '交互式操作，可前进或回退步骤',
            feature4: '适合课堂教学、家庭辅导、自主学习',
            howToUse: '使用方法',
            step1: '输入 被除数 与 除数',
            step2: '根据需要设置 小数位数',
            step3: '点击 生成，工具会开始演示',
            step4: '使用 下一步 或 上一步 按钮查看具体过程',
            step5: '点击 重新开始 可清空数据并重新操作',
            detailedSteps: '长除法的计算步骤详解',
            stepsIntro: '以下是长除法的标准步骤：',
            detailStep1: '确定被除数的前几位是否大于除数，找到第一个可以整除的位置。',
            detailStep2: '写出商的第一位。',
            detailStep3: '用商乘以除数，得到部分积。',
            detailStep4: '将部分积与被除数的对应部分相减，得到余数。',
            detailStep5: '将余数与被除数的下一位"放下来"，组成新的被除数。',
            detailStep6: '重复以上步骤，直到被除数全部用完，或达到所需小数位。',
            example: '例如：864 ÷ 12 → 首先 86 ÷ 12 = 7 …… 余 2，然后将 4 放下来，继续计算。',
            faq: '常见问题 (FAQ)',
            faqQ1: '长除法和短除法有什么区别？',
            faqA1: '短除法适合小数除以个位数的简单计算，长除法适合大数或复杂小数的计算，步骤更详细。',
            faqQ2: '小学生学习长除法时常见困难是什么？',
            faqA2: '常见难点包括"确定商的位数"和"余数与下一位数的结合"。通过动画演示可以帮助学生更直观地理解。',
            faqQ3: '这个工具适合哪些人？',
            faqA3: '适合小学生、中学生、教师、家长，或任何想要复习和掌握长除法的人。',
            copyright: '© 2025 交互式长除法演示工具 | 数学学习与教学辅助平台'
        }
    },
    'en': {
        name: 'English',
        flag: '🇺🇸',
        translations: {
            title: 'Interactive Long Division Demo',
            subtitle: 'Learn every step of long division through animation',
            dividend: 'Dividend',
            divisor: 'Divisor',
            decimals: 'Decimal Places',
            generate: 'Generate',
            nextStep: 'Next Step',
            prevStep: 'Previous',
            restart: 'Restart',
            dividendPlaceholder: 'Enter dividend',
            divisorPlaceholder: 'Enter divisor',
            decimalsPlaceholder: 'Decimal places (0-12)',
            errorDivisorZero: 'Divisor cannot be zero!',
            errorInvalidInput: 'Please enter valid numbers!',
            errorDecimalRange: 'Decimal places must be between 0-12!',
            stepInfo: 'Step',
            quotient: 'Quotient',
            remainder: 'Remainder',
            product: 'Product',
            // Educational content translations
            whatIsLongDivision: 'What is Long Division?',
            longDivisionDesc1: 'Long division is a step-by-step division calculation method, commonly used for large numbers or decimal operations. Through repeated operations of "quotient, remainder, subtraction", it helps students gradually understand the logic of division, rather than simply memorizing formulas.',
            longDivisionDesc2: 'In elementary mathematics learning, long division is an important advanced step that lays the foundation for fraction operations, decimal operations, and algebra.',
            toolFeatures: 'Tool Features',
            feature1: 'Step-by-step demonstration of the complete long division process',
            feature2: 'Support for integer and decimal division',
            feature3: 'Interactive operation with forward and backward steps',
            feature4: 'Suitable for classroom teaching, home tutoring, and self-learning',
            howToUse: 'How to Use',
            step1: 'Enter the dividend and divisor',
            step2: 'Set the decimal places as needed',
            step3: 'Click Generate to start the demonstration',
            step4: 'Use Next Step or Previous buttons to view the specific process',
            step5: 'Click Restart to clear data and start over',
            detailedSteps: 'Detailed Steps of Long Division',
            stepsIntro: 'Here are the standard steps of long division:',
            detailStep1: 'Determine if the first few digits of the dividend are greater than the divisor, find the first position that can be divided.',
            detailStep2: 'Write the first digit of the quotient.',
            detailStep3: 'Multiply the quotient by the divisor to get the partial product.',
            detailStep4: 'Subtract the partial product from the corresponding part of the dividend to get the remainder.',
            detailStep5: 'Bring down the next digit of the dividend with the remainder to form a new dividend.',
            detailStep6: 'Repeat the above steps until all digits of the dividend are used or the required decimal places are reached.',
            example: 'For example: 864 ÷ 12 → First 86 ÷ 12 = 7 remainder 2, then bring down 4 and continue calculating.',
            faq: 'Frequently Asked Questions (FAQ)',
            faqQ1: 'What is the difference between long division and short division?',
            faqA1: 'Short division is suitable for simple calculations of small numbers divided by single digits, while long division is suitable for large numbers or complex decimal calculations with more detailed steps.',
            faqQ2: 'What are common difficulties for elementary students learning long division?',
            faqA2: 'Common difficulties include "determining the number of digits in the quotient" and "combining remainder with the next digit". Animation demonstrations can help students understand more intuitively.',
            faqQ3: 'Who is this tool suitable for?',
            faqA3: 'Suitable for elementary students, middle school students, teachers, parents, or anyone who wants to review and master long division.',
            copyright: '© 2025 Interactive Long Division Demo | Mathematics Learning & Teaching Platform'
        }
    },
    'de': {
        name: 'Deutsch',
        flag: '🇩🇪',
        translations: {
            title: 'Interaktive Schriftliche Division Demo',
            subtitle: 'Lernen Sie jeden Schritt der schriftlichen Division durch Animation',
            dividend: 'Dividend',
            divisor: 'Divisor',
            decimals: 'Dezimalstellen',
            generate: 'Generieren',
            nextStep: 'Nächster Schritt',
            prevStep: 'Zurück',
            restart: 'Neustart',
            dividendPlaceholder: 'Dividend eingeben',
            divisorPlaceholder: 'Divisor eingeben',
            decimalsPlaceholder: 'Dezimalstellen (0-12)',
            errorDivisorZero: 'Divisor kann nicht null sein!',
            errorInvalidInput: 'Bitte geben Sie gültige Zahlen ein!',
            errorDecimalRange: 'Dezimalstellen müssen zwischen 0-12 liegen!',
            stepInfo: 'Schritt',
            quotient: 'Quotient',
            remainder: 'Rest',
            product: 'Produkt',
            // Educational content translations
            whatIsLongDivision: 'Was ist schriftliche Division?',
            longDivisionDesc1: 'Die schriftliche Division ist eine schrittweise Divisionsmethode, die üblicherweise für große Zahlen oder Dezimaloperationen verwendet wird. Durch wiederholte Operationen von "Quotient, Rest, Subtraktion" hilft sie Schülern, die Logik der Division schrittweise zu verstehen, anstatt einfach Formeln auswendig zu lernen.',
            longDivisionDesc2: 'Im Grundschulmathematik-Lernen ist die schriftliche Division ein wichtiger fortgeschrittener Schritt, der die Grundlage für Bruchoperationen, Dezimaloperationen und Algebra legt.',
            toolFeatures: 'Tool-Funktionen',
            feature1: 'Schrittweise Demonstration des vollständigen schriftlichen Divisionsprozesses',
            feature2: 'Unterstützung für Ganzzahl- und Dezimaldivision',
            feature3: 'Interaktive Bedienung mit Vor- und Rückwärtsschritten',
            feature4: 'Geeignet für Klassenunterricht, Hausunterricht und Selbstlernen',
            howToUse: 'Verwendung',
            step1: 'Dividend und Divisor eingeben',
            step2: 'Dezimalstellen nach Bedarf einstellen',
            step3: 'Auf Generieren klicken, um die Demonstration zu starten',
            step4: 'Verwenden Sie die Schaltflächen Nächster Schritt oder Zurück, um den spezifischen Prozess anzuzeigen',
            step5: 'Klicken Sie auf Neustart, um Daten zu löschen und neu zu beginnen',
            detailedSteps: 'Detaillierte Schritte der schriftlichen Division',
            stepsIntro: 'Hier sind die Standardschritte der schriftlichen Division:',
            detailStep1: 'Bestimmen Sie, ob die ersten Ziffern des Dividenden größer als der Divisor sind, finden Sie die erste Position, die geteilt werden kann.',
            detailStep2: 'Schreiben Sie die erste Ziffer des Quotienten.',
            detailStep3: 'Multiplizieren Sie den Quotienten mit dem Divisor, um das Teilprodukt zu erhalten.',
            detailStep4: 'Subtrahieren Sie das Teilprodukt vom entsprechenden Teil des Dividenden, um den Rest zu erhalten.',
            detailStep5: 'Bringen Sie die nächste Ziffer des Dividenden mit dem Rest herunter, um einen neuen Dividenden zu bilden.',
            detailStep6: 'Wiederholen Sie die obigen Schritte, bis alle Ziffern des Dividenden verwendet sind oder die erforderlichen Dezimalstellen erreicht sind.',
            example: 'Zum Beispiel: 864 ÷ 12 → Zuerst 86 ÷ 12 = 7 Rest 2, dann 4 herunterbringen und weiter rechnen.',
            faq: 'Häufig gestellte Fragen (FAQ)',
            faqQ1: 'Was ist der Unterschied zwischen langer und kurzer Division?',
            faqA1: 'Kurze Division eignet sich für einfache Berechnungen kleiner Zahlen geteilt durch einstellige Zahlen, während lange Division für große Zahlen oder komplexe Dezimalberechnungen mit detaillierteren Schritten geeignet ist.',
            faqQ2: 'Was sind häufige Schwierigkeiten für Grundschüler beim Erlernen der langen Division?',
            faqA2: 'Häufige Schwierigkeiten umfassen "Bestimmung der Anzahl der Ziffern im Quotienten" und "Kombination von Rest mit der nächsten Ziffer". Animationsdemonstrationen können Schülern helfen, intuitiver zu verstehen.',
            faqQ3: 'Für wen ist dieses Tool geeignet?',
            faqA3: 'Geeignet für Grundschüler, Mittelschüler, Lehrer, Eltern oder jeden, der die lange Division überprüfen und beherrschen möchte.',
            copyright: '© 2025 Interaktive Schriftliche Division Demo | Mathematik Lern- & Lehrplattform'
        }
    },
    'fr': {
        name: 'Français',
        flag: '🇫🇷',
        translations: {
            title: 'Démonstration Interactive de Division Longue',
            subtitle: 'Apprenez chaque étape de la division longue par animation',
            dividend: 'Dividende',
            divisor: 'Diviseur',
            decimals: 'Décimales',
            generate: 'Générer',
            nextStep: 'Étape Suivante',
            prevStep: 'Précédent',
            restart: 'Recommencer',
            dividendPlaceholder: 'Entrez le dividende',
            divisorPlaceholder: 'Entrez le diviseur',
            decimalsPlaceholder: 'Décimales (0-12)',
            errorDivisorZero: 'Le diviseur ne peut pas être zéro!',
            errorInvalidInput: 'Veuillez entrer des nombres valides!',
            errorDecimalRange: 'Les décimales doivent être entre 0-12!',
            stepInfo: 'Étape',
            quotient: 'Quotient',
            remainder: 'Reste',
            product: 'Produit',
            // Educational content translations
            whatIsLongDivision: 'Qu\'est-ce que la division longue ?',
            longDivisionDesc1: 'La division longue est une méthode de calcul de division étape par étape, couramment utilisée pour les grands nombres ou les opérations décimales. Grâce aux opérations répétées de "quotient, reste, soustraction", elle aide les étudiants à comprendre progressivement la logique de la division, plutôt que de simplement mémoriser des formules.',
            longDivisionDesc2: 'Dans l\'apprentissage des mathématiques élémentaires, la division longue est une étape avancée importante qui pose les bases des opérations de fractions, des opérations décimales et de l\'algèbre.',
            toolFeatures: 'Caractéristiques de l\'outil',
            feature1: 'Démonstration étape par étape du processus complet de division longue',
            feature2: 'Support pour la division d\'entiers et de décimales',
            feature3: 'Opération interactive avec étapes avant et arrière',
            feature4: 'Adapté à l\'enseignement en classe, au tutorat à domicile et à l\'auto-apprentissage',
            howToUse: 'Comment utiliser',
            step1: 'Entrez le dividende et le diviseur',
            step2: 'Définissez les décimales selon les besoins',
            step3: 'Cliquez sur Générer pour commencer la démonstration',
            step4: 'Utilisez les boutons Étape suivante ou Précédent pour voir le processus spécifique',
            step5: 'Cliquez sur Recommencer pour effacer les données et recommencer',
            detailedSteps: 'Étapes détaillées de la division longue',
            stepsIntro: 'Voici les étapes standard de la division longue :',
            detailStep1: 'Déterminez si les premiers chiffres du dividende sont supérieurs au diviseur, trouvez la première position qui peut être divisée.',
            detailStep2: 'Écrivez le premier chiffre du quotient.',
            detailStep3: 'Multipliez le quotient par le diviseur pour obtenir le produit partiel.',
            detailStep4: 'Soustrayez le produit partiel de la partie correspondante du dividende pour obtenir le reste.',
            detailStep5: 'Abaissez le chiffre suivant du dividende avec le reste pour former un nouveau dividende.',
            detailStep6: 'Répétez les étapes ci-dessus jusqu\'à ce que tous les chiffres du dividende soient utilisés ou que les décimales requises soient atteintes.',
            example: 'Par exemple : 864 ÷ 12 → D\'abord 86 ÷ 12 = 7 reste 2, puis abaissez 4 et continuez le calcul.',
            faq: 'Questions fréquemment posées (FAQ)',
            faqQ1: 'Quelle est la différence entre la division longue et la division courte ?',
            faqA1: 'La division courte convient aux calculs simples de petits nombres divisés par des chiffres uniques, tandis que la division longue convient aux grands nombres ou aux calculs décimaux complexes avec des étapes plus détaillées.',
            faqQ2: 'Quelles sont les difficultés courantes pour les élèves du primaire qui apprennent la division longue ?',
            faqA2: 'Les difficultés courantes incluent "déterminer le nombre de chiffres dans le quotient" et "combiner le reste avec le chiffre suivant". Les démonstrations d\'animation peuvent aider les étudiants à comprendre plus intuitivement.',
            faqQ3: 'À qui cet outil convient-il ?',
            faqA3: 'Convient aux élèves du primaire, aux collégiens, aux enseignants, aux parents ou à toute personne qui souhaite réviser et maîtriser la division longue.',
            copyright: '© 2025 Démonstration Interactive de Division Longue | Plateforme d\'Apprentissage et d\'Enseignement des Mathématiques'
        }
    },
    'ja': {
        name: '日本語',
        flag: '🇯🇵',
        translations: {
            title: 'インタラクティブ筆算割り算デモ',
            subtitle: 'アニメーションで筆算割り算の各ステップを学習',
            dividend: '被除数',
            divisor: '除数',
            decimals: '小数点以下桁数',
            generate: '生成',
            nextStep: '次のステップ',
            prevStep: '前へ',
            restart: '再開始',
            dividendPlaceholder: '被除数を入力',
            divisorPlaceholder: '除数を入力',
            decimalsPlaceholder: '小数点以下桁数 (0-12)',
            errorDivisorZero: '除数はゼロにできません！',
            errorInvalidInput: '有効な数字を入力してください！',
            errorDecimalRange: '小数点以下桁数は0-12の間である必要があります！',
            stepInfo: 'ステップ',
            quotient: '商',
            remainder: '余り',
            product: '積',
            // Educational content translations
            whatIsLongDivision: '筆算割り算とは？',
            longDivisionDesc1: '筆算割り算は段階的な除法計算方法で、通常大きな数や小数の演算に使用されます。「商、余り、減法」の反復操作を通じて、学生が公式を単純に暗記するのではなく、除法の論理を段階的に理解できるよう支援します。',
            longDivisionDesc2: '小学校数学学習において、筆算割り算は重要な上級段階であり、分数演算、小数演算、代数の基礎を築きます。',
            toolFeatures: 'ツールの特徴',
            feature1: '筆算割り算の完全な計算過程の段階的デモンストレーション',
            feature2: '整数と小数の除法をサポート',
            feature3: '前進・後退ステップでのインタラクティブ操作',
            feature4: '教室での指導、家庭教師、自主学習に適している',
            howToUse: '使用方法',
            step1: '被除数と除数を入力',
            step2: '必要に応じて小数点以下桁数を設定',
            step3: '生成をクリックしてデモンストレーションを開始',
            step4: '次のステップまたは前へボタンを使用して具体的なプロセスを表示',
            step5: '再開始をクリックしてデータをクリアして再開',
            detailedSteps: '筆算割り算の詳細ステップ',
            stepsIntro: '以下は筆算割り算の標準ステップです：',
            detailStep1: '被除数の最初の数桁が除数より大きいかどうかを判断し、除算可能な最初の位置を見つけます。',
            detailStep2: '商の最初の桁を書きます。',
            detailStep3: '商に除数を掛けて部分積を得ます。',
            detailStep4: '被除数の対応部分から部分積を引いて余りを得ます。',
            detailStep5: '余りと被除数の次の桁を「下ろして」新しい被除数を形成します。',
            detailStep6: '被除数のすべての桁が使用されるか、必要な小数点以下桁数に達するまで上記のステップを繰り返します。',
            example: '例：864 ÷ 12 → まず 86 ÷ 12 = 7 余り 2、次に 4 を下ろして計算を続けます。',
            faq: 'よくある質問（FAQ）',
            faqQ1: '筆算割り算と暗算割り算の違いは何ですか？',
            faqA1: '暗算割り算は一桁で割る小さな数の簡単な計算に適していますが、筆算割り算は大きな数や複雑な小数計算により詳細なステップで適しています。',
            faqQ2: '小学生が筆算割り算を学ぶ際の一般的な困難は何ですか？',
            faqA2: '一般的な困難には「商の桁数の決定」と「余りと次の桁の結合」が含まれます。アニメーションデモンストレーションは学生がより直感的に理解するのに役立ちます。',
            faqQ3: 'このツールは誰に適していますか？',
            faqA3: '小学生、中学生、教師、保護者、または筆算割り算を復習し習得したい人に適しています。',
            copyright: '© 2025 インタラクティブ筆算割り算デモ | 数学学習・教育プラットフォーム'
        }
    },
    'pt': {
        name: 'Português',
        flag: '🇧🇷',
        translations: {
            title: 'Demonstração Interativa de Divisão Longa',
            subtitle: 'Aprenda cada passo da divisão longa através de animação',
            dividend: 'Dividendo',
            divisor: 'Divisor',
            decimals: 'Casas Decimais',
            generate: 'Gerar',
            nextStep: 'Próximo Passo',
            prevStep: 'Anterior',
            restart: 'Reiniciar',
            dividendPlaceholder: 'Digite o dividendo',
            divisorPlaceholder: 'Digite o divisor',
            decimalsPlaceholder: 'Casas decimais (0-12)',
            errorDivisorZero: 'O divisor não pode ser zero!',
            errorInvalidInput: 'Por favor, digite números válidos!',
            errorDecimalRange: 'Casas decimais devem estar entre 0-12!',
            stepInfo: 'Passo',
            quotient: 'Quociente',
            remainder: 'Resto',
            product: 'Produto',
            // Educational content translations
            whatIsLongDivision: 'O que é divisão longa?',
            longDivisionDesc1: 'A divisão longa é um método de cálculo de divisão passo a passo, comumente usado para números grandes ou operações decimais. Através de operações repetidas de "quociente, resto, subtração", ajuda os estudantes a compreender gradualmente a lógica da divisão, em vez de simplesmente memorizar fórmulas.',
            longDivisionDesc2: 'No aprendizado de matemática elementar, a divisão longa é um passo avançado importante que estabelece a base para operações de frações, operações decimais e álgebra.',
            toolFeatures: 'Características da Ferramenta',
            feature1: 'Demonstração passo a passo do processo completo de divisão longa',
            feature2: 'Suporte para divisão de inteiros e decimais',
            feature3: 'Operação interativa com passos para frente e para trás',
            feature4: 'Adequado para ensino em sala de aula, tutoria domiciliar e auto-aprendizagem',
            howToUse: 'Como Usar',
            step1: 'Digite o dividendo e o divisor',
            step2: 'Defina as casas decimais conforme necessário',
            step3: 'Clique em Gerar para iniciar a demonstração',
            step4: 'Use os botões Próximo Passo ou Anterior para ver o processo específico',
            step5: 'Clique em Reiniciar para limpar os dados e começar novamente',
            detailedSteps: 'Passos Detalhados da Divisão Longa',
            stepsIntro: 'Aqui estão os passos padrão da divisão longa:',
            detailStep1: 'Determine se os primeiros dígitos do dividendo são maiores que o divisor, encontre a primeira posição que pode ser dividida.',
            detailStep2: 'Escreva o primeiro dígito do quociente.',
            detailStep3: 'Multiplique o quociente pelo divisor para obter o produto parcial.',
            detailStep4: 'Subtraia o produto parcial da parte correspondente do dividendo para obter o resto.',
            detailStep5: 'Abaixe o próximo dígito do dividendo com o resto para formar um novo dividendo.',
            detailStep6: 'Repita os passos acima até que todos os dígitos do dividendo sejam usados ou as casas decimais necessárias sejam alcançadas.',
            example: 'Por exemplo: 864 ÷ 12 → Primeiro 86 ÷ 12 = 7 resto 2, então abaixe 4 e continue calculando.',
            faq: 'Perguntas Frequentes (FAQ)',
            faqQ1: 'Qual é a diferença entre divisão longa e divisão curta?',
            faqA1: 'A divisão curta é adequada para cálculos simples de números pequenos divididos por dígitos únicos, enquanto a divisão longa é adequada para números grandes ou cálculos decimais complexos com passos mais detalhados.',
            faqQ2: 'Quais são as dificuldades comuns para estudantes do ensino fundamental aprendendo divisão longa?',
            faqA2: 'Dificuldades comuns incluem "determinar o número de dígitos no quociente" e "combinar resto com o próximo dígito". Demonstrações de animação podem ajudar os estudantes a entender mais intuitivamente.',
            faqQ3: 'Para quem esta ferramenta é adequada?',
            faqA3: 'Adequada para estudantes do ensino fundamental, estudantes do ensino médio, professores, pais ou qualquer pessoa que queira revisar e dominar a divisão longa.',
            copyright: '© 2025 Demonstração Interativa de Divisão Longa | Plataforma de Aprendizagem e Ensino de Matemática'
        }
    },
    'ru': {
        name: 'Русский',
        flag: '🇷🇺',
        translations: {
            title: 'Интерактивная Демонстрация Деления в Столбик',
            subtitle: 'Изучите каждый шаг деления в столбик через анимацию',
            dividend: 'Делимое',
            divisor: 'Делитель',
            decimals: 'Десятичные знаки',
            generate: 'Генерировать',
            nextStep: 'Следующий шаг',
            prevStep: 'Назад',
            restart: 'Перезапуск',
            dividendPlaceholder: 'Введите делимое',
            divisorPlaceholder: 'Введите делитель',
            decimalsPlaceholder: 'Десятичные знаки (0-12)',
            errorDivisorZero: 'Делитель не может быть нулем!',
            errorInvalidInput: 'Пожалуйста, введите действительные числа!',
            errorDecimalRange: 'Десятичные знаки должны быть между 0-12!',
            stepInfo: 'Шаг',
            quotient: 'Частное',
            remainder: 'Остаток',
            product: 'Произведение',
            // Educational content translations
            whatIsLongDivision: 'Что такое деление в столбик?',
            longDivisionDesc1: 'Деление в столбик - это пошаговый метод вычисления деления, обычно используемый для больших чисел или десятичных операций. Через повторяющиеся операции "частное, остаток, вычитание" он помогает студентам постепенно понять логику деления, а не просто запоминать формулы.',
            longDivisionDesc2: 'В изучении элементарной математики деление в столбик является важным продвинутым шагом, который закладывает основу для операций с дробями, десятичными операциями и алгеброй.',
            toolFeatures: 'Особенности инструмента',
            feature1: 'Пошаговая демонстрация полного процесса деления в столбик',
            feature2: 'Поддержка деления целых чисел и десятичных дробей',
            feature3: 'Интерактивная работа с шагами вперед и назад',
            feature4: 'Подходит для классного обучения, домашнего репетиторства и самообучения',
            howToUse: 'Как использовать',
            step1: 'Введите делимое и делитель',
            step2: 'Установите десятичные знаки по необходимости',
            step3: 'Нажмите Генерировать, чтобы начать демонстрацию',
            step4: 'Используйте кнопки Следующий шаг или Назад для просмотра конкретного процесса',
            step5: 'Нажмите Перезапуск, чтобы очистить данные и начать заново',
            detailedSteps: 'Подробные шаги деления в столбик',
            stepsIntro: 'Вот стандартные шаги деления в столбик:',
            detailStep1: 'Определите, больше ли первые цифры делимого, чем делитель, найдите первую позицию, которую можно разделить.',
            detailStep2: 'Запишите первую цифру частного.',
            detailStep3: 'Умножьте частное на делитель, чтобы получить частичное произведение.',
            detailStep4: 'Вычтите частичное произведение из соответствующей части делимого, чтобы получить остаток.',
            detailStep5: 'Снесите следующую цифру делимого с остатком, чтобы сформировать новое делимое.',
            detailStep6: 'Повторяйте вышеуказанные шаги, пока не будут использованы все цифры делимого или не будут достигнуты требуемые десятичные знаки.',
            example: 'Например: 864 ÷ 12 → Сначала 86 ÷ 12 = 7 остаток 2, затем снесите 4 и продолжите вычисления.',
            faq: 'Часто задаваемые вопросы (FAQ)',
            faqQ1: 'В чем разница между длинным и коротким делением?',
            faqA1: 'Короткое деление подходит для простых вычислений малых чисел, деленных на однозначные числа, в то время как длинное деление подходит для больших чисел или сложных десятичных вычислений с более подробными шагами.',
            faqQ2: 'Какие общие трудности у учеников начальной школы при изучении длинного деления?',
            faqA2: 'Общие трудности включают "определение количества цифр в частном" и "объединение остатка со следующей цифрой". Анимационные демонстрации могут помочь студентам понять более интуитивно.',
            faqQ3: 'Для кого подходит этот инструмент?',
            faqA3: 'Подходит для учеников начальной школы, учеников средней школы, учителей, родителей или любого, кто хочет повторить и освоить длинное деление.',
            copyright: '© 2025 Интерактивная Демонстрация Деления в Столбик | Платформа Изучения и Преподавания Математики'
        }
    },
    'es': {
        name: 'Español',
        flag: '🇪🇸',
        translations: {
            title: 'Demostración Interactiva de División Larga',
            subtitle: 'Aprende cada paso de la división larga a través de animación',
            dividend: 'Dividendo',
            divisor: 'Divisor',
            decimals: 'Decimales',
            generate: 'Generar',
            nextStep: 'Siguiente Paso',
            prevStep: 'Anterior',
            restart: 'Reiniciar',
            dividendPlaceholder: 'Ingrese el dividendo',
            divisorPlaceholder: 'Ingrese el divisor',
            decimalsPlaceholder: 'Decimales (0-12)',
            errorDivisorZero: '¡El divisor no puede ser cero!',
            errorInvalidInput: '¡Por favor ingrese números válidos!',
            errorDecimalRange: '¡Los decimales deben estar entre 0-12!',
            stepInfo: 'Paso',
            quotient: 'Cociente',
            remainder: 'Residuo',
            product: 'Producto',
            // Educational content translations
            whatIsLongDivision: '¿Qué es la división larga?',
            longDivisionDesc1: 'La división larga es un método de cálculo de división paso a paso, comúnmente usado para números grandes u operaciones decimales. A través de operaciones repetidas de "cociente, residuo, sustracción", ayuda a los estudiantes a comprender gradualmente la lógica de la división, en lugar de simplemente memorizar fórmulas.',
            longDivisionDesc2: 'En el aprendizaje de matemáticas elementales, la división larga es un paso avanzado importante que establece la base para operaciones de fracciones, operaciones decimales y álgebra.',
            toolFeatures: 'Características de la Herramienta',
            feature1: 'Demostración paso a paso del proceso completo de división larga',
            feature2: 'Soporte para división de enteros y decimales',
            feature3: 'Operación interactiva con pasos hacia adelante y hacia atrás',
            feature4: 'Adecuado para enseñanza en el aula, tutoría en casa y auto-aprendizaje',
            howToUse: 'Cómo Usar',
            step1: 'Ingrese el dividendo y el divisor',
            step2: 'Establezca los decimales según sea necesario',
            step3: 'Haga clic en Generar para comenzar la demostración',
            step4: 'Use los botones Siguiente Paso o Anterior para ver el proceso específico',
            step5: 'Haga clic en Reiniciar para limpiar los datos y comenzar de nuevo',
            detailedSteps: 'Pasos Detallados de la División Larga',
            stepsIntro: 'Aquí están los pasos estándar de la división larga:',
            detailStep1: 'Determine si los primeros dígitos del dividendo son mayores que el divisor, encuentre la primera posición que se puede dividir.',
            detailStep2: 'Escriba el primer dígito del cociente.',
            detailStep3: 'Multiplique el cociente por el divisor para obtener el producto parcial.',
            detailStep4: 'Reste el producto parcial de la parte correspondiente del dividendo para obtener el residuo.',
            detailStep5: 'Baje el siguiente dígito del dividendo con el residuo para formar un nuevo dividendo.',
            detailStep6: 'Repita los pasos anteriores hasta que se usen todos los dígitos del dividendo o se alcancen los decimales requeridos.',
            example: 'Por ejemplo: 864 ÷ 12 → Primero 86 ÷ 12 = 7 residuo 2, luego baje 4 y continúe calculando.',
            faq: 'Preguntas Frecuentes (FAQ)',
            faqQ1: '¿Cuál es la diferencia entre división larga y división corta?',
            faqA1: 'La división corta es adecuada para cálculos simples de números pequeños divididos por dígitos únicos, mientras que la división larga es adecuada para números grandes o cálculos decimales complejos con pasos más detallados.',
            faqQ2: '¿Cuáles son las dificultades comunes para los estudiantes de primaria que aprenden división larga?',
            faqA2: 'Las dificultades comunes incluyen "determinar el número de dígitos en el cociente" y "combinar el residuo con el siguiente dígito". Las demostraciones de animación pueden ayudar a los estudiantes a entender más intuitivamente.',
            faqQ3: '¿Para quién es adecuada esta herramienta?',
            faqA3: 'Adecuada para estudiantes de primaria, estudiantes de secundaria, maestros, padres o cualquier persona que quiera revisar y dominar la división larga.',
            copyright: '© 2025 Demostración Interactiva de División Larga | Plataforma de Aprendizaje y Enseñanza de Matemáticas'
        }
    }
};

// 语言管理器
class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.init();
    }

    detectLanguage() {
        // 优先使用localStorage中保存的语言
        const savedLang = localStorage.getItem('longDivisionLang');
        if (savedLang && languages[savedLang]) {
            return savedLang;
        }

        // 其次使用浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 精确匹配
        if (languages[browserLang]) {
            return browserLang;
        }

        // 模糊匹配（如 en-US 匹配 en）
        const langCode = browserLang.split('-')[0];
        for (const key in languages) {
            if (key.startsWith(langCode)) {
                return key;
            }
        }

        // 默认返回中文
        return 'zh-CN';
    }

    init() {
        this.createLanguageSelector();
        this.updateContent();
    }

    createLanguageSelector() {
        const header = document.querySelector('header');
        if (!header) return;

        const langSelector = document.createElement('div');
        langSelector.className = 'language-selector';
        langSelector.innerHTML = `
            <select id="languageSelect" class="language-select">
                ${Object.entries(languages).map(([code, lang]) => 
                    `<option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>
                        ${lang.flag} ${lang.name}
                    </option>`
                ).join('')}
            </select>
        `;

        header.appendChild(langSelector);

        // 添加事件监听器
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    changeLanguage(langCode) {
        if (!languages[langCode]) return;

        this.currentLanguage = langCode;
        localStorage.setItem('longDivisionLang', langCode);
        this.updateContent();
    }

    updateContent() {
        const translations = languages[this.currentLanguage].translations;

        // 更新页面标题
        document.title = translations.title;

        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        // 更新按钮值
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            if (translations[key]) {
                element.value = translations[key];
            }
        });
    }

    t(key) {
        return languages[this.currentLanguage].translations[key] || key;
    }
}

// 全局语言管理器实例
let langManager;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    langManager = new LanguageManager();
});
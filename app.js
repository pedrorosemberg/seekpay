document.addEventListener('DOMContentLoaded', () => {
    const accountNameInput = document.getElementById('account-name');
    const accountBalanceInput = document.getElementById('account-balance');
    const addAccountButton = document.getElementById('add-account-button');
    const accountsList = document.getElementById('accounts-list');
    const totalBalanceSpan = document.getElementById('total-balance');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const transactionCategorySelect = document.getElementById('transaction-category');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionDateInput = document.getElementById('transaction-date');
    const addTransactionButton = document.getElementById('add-transaction-button');
    const transactionsList = document.getElementById('transactions-list');
    const incomeExpenseChartElement = document.getElementById('income-expense-chart');
    const categoryPieChartElement = document.getElementById('category-pie-chart');

    let accounts = [];
    let transactions = [];

    let incomeExpenseChart;
    let categoryPieChart;

    const supabaseUrl = 'https://hhuxfoqnksgghhyctksi.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXhmb3Fua3NnZ2hoeWN0a3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwNDc1OTksImV4cCI6MjAzNzYyMzU5OX0.AGCd7t0aFfNEegiU4YTAfSUH2rp4zqpRU-CPKv7fIo';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    async function addAccount(name, balance) {
        const { data, error } = await supabase
            .from('accounts')
            .insert([{ name: name, balance: balance }]);
        
        if (error) {
            console.error('Erro ao adicionar conta:', error);
        } else {
            console.log('Conta adicionada:', data);
            loadAccounts(); // Atualiza a lista de contas
        }
    }

    async function loadAccounts() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*');

        if (error) {
            console.error('Erro ao carregar contas:', error);
        } else {
            accountsList.innerHTML = ''; // Limpa a lista antes de adicionar novas contas

            data.forEach(account => {
                const accountElement = document.createElement('li');
                accountElement.textContent = `${account.name}: R$${account.balance.toFixed(2)}`;
                accountElement.dataset.accountName = account.name; // Adiciona um dataset para manipulação futura
                accountsList.appendChild(accountElement);
            });
        }
    }

    async function addTransaction(type, category, amount, date, accountName) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{ 
                type: type,
                category: category,
                amount: amount,
                date: date,
                account: accountName
            }]);
        
        if (error) {
            console.error('Erro ao adicionar transação:', error);
        } else {
            console.log('Transação adicionada:', data);
            loadTransactions(); // Atualiza a lista de transações
        }
    }

    async function loadTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*');

        if (error) {
            console.error('Erro ao carregar transações:', error);
        } else {
            transactionsList.innerHTML = ''; // Limpa a lista antes de adicionar novas transações

            data.forEach(transaction => {
                const transactionElement = document.createElement('li');
                transactionElement.textContent = `${transaction.date} - ${transaction.type === 'entry' ? 'Recebível' : 'Gasto/Despesa'}: ${transaction.category} - R$${transaction.amount.toFixed(2)} (Conta: ${transaction.account})`;
                transactionElement.style.color = transaction.type === 'entry' ? 'green' : 'red';
                transactionsList.appendChild(transactionElement);
            });
        }
    }

    function updateTotalBalance() {
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        totalBalanceSpan.textContent = `R$${totalBalance.toFixed(2)}`;
        totalBalanceSpan.style.color = totalBalance >= 0 ? 'blue' : 'red';
    }

    function updateTransactionCategories() {
        const transactionType = transactionTypeSelect.value;
        transactionCategorySelect.innerHTML = '';

        const categories = transactionType === 'entry'
            ? ['Investimentos', 'Salário e Pagamentos', 'Outros']
            : ['Aluguel', 'Impostos', 'Folha de Pagamento', 'Taxas', 'Contas', 'Assinaturas'];

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            transactionCategorySelect.appendChild(option);
        });
    }

    function addAccount() {
        const accountName = accountNameInput.value.trim();
        const accountBalance = parseFloat(accountBalanceInput.value);

        if (!accountName || isNaN(accountBalance)) {
            alert('Por favor, insira uma conta bancária válida e um saldo.');
            return;
        }

        // Adiciona a conta no banco de dados
        addAccount(accountName, accountBalance);

        // Adiciona a conta na lista local
        accounts.push({ name: accountName, balance: accountBalance });
        accountNameInput.value = '';
        accountBalanceInput.value = '';

        const accountElement = document.createElement('li');
        accountElement.textContent = `${accountName}: R$${accountBalance.toFixed(2)}`;
        accountElement.dataset.accountName = accountName;
        accountsList.appendChild(accountElement);

        updateTotalBalance();
        updateAccountOptions();
    }

    function updateAccountOptions() {
        const accountSelect = document.getElementById('transaction-account');
        accountSelect.innerHTML = '';

        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.name;
            option.textContent = account.name;
            accountSelect.appendChild(option);
        });
    }

    function addTransaction() {
        const transactionType = transactionTypeSelect.value;
        const transactionCategory = transactionCategorySelect.value;
        const transactionAmount = parseFloat(transactionAmountInput.value);
        const transactionDate = transactionDateInput.value;
        const transactionAccount = document.getElementById('transaction-account').value;

        if (isNaN(transactionAmount) || !transactionDate || !transactionAccount) {
            alert('Por favor, insira todos os detalhes da transação corretamente.');
            return;
        }

        const account = accounts.find(acc => acc.name === transactionAccount);
        if (!account) {
            alert('Conta bancária não encontrada.');
            return;
        }

        // Adiciona a transação no banco de dados
        addTransaction(transactionType, transactionCategory, transactionAmount, transactionDate, transactionAccount);

        // Adiciona a transação na lista local
        transactions.push({
            type: transactionType,
            category: transactionCategory,
            amount: transactionAmount,
            date: transactionDate,
            account: transactionAccount
        });
        transactionAmountInput.value = '';
        transactionDateInput.value = '';

        const transactionElement = document.createElement('li');
        transactionElement.textContent = `${transactionDate} - ${transactionType === 'entry' ? 'Recebível' : 'Gasto/Despesa'}: ${transactionCategory} - R$${transactionAmount.toFixed(2)} (Conta: ${transactionAccount})`;

        if (transactionType === 'entry') {
            transactionElement.style.color = 'green';
            transactionElement.textContent = `+ ${transactionElement.textContent}`;
            account.balance += transactionAmount;
        } else {
            transactionElement.style.color = 'red';
            transactionElement.textContent = `- ${transactionElement.textContent}`;
            account.balance -= transactionAmount;
        }

        transactionsList.appendChild(transactionElement);

        updateTotalBalance();
        updateAccountBalance(account);
        updateCharts();
    }

    function updateAccountBalance(account) {
        const accountElements = Array.from(accountsList.children);
        const accountElement = accountElements.find(element => element.dataset.accountName === account.name);
        if (accountElement) {
            accountElement.textContent = `${account.name}: R$${account.balance.toFixed(2)}`;
        }
    }

    function updateCharts() {
        const entrySum = transactions
            .filter(transaction => transaction.type === 'entry')
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        const exitSum = transactions
            .filter(transaction => transaction.type === 'exit')
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        if (incomeExpenseChart) {
            incomeExpenseChart.data.datasets[0].data = [entrySum, exitSum];
            incomeExpenseChart.update();
        } else {
                        incomeExpenseChart = new Chart(incomeExpenseChartElement, {
                type: 'bar',
                data: {
                    labels: ['Recebível', 'Gasto/Despesa'],
                    datasets: [{
                        label: 'Recebíveis vs Gastos/Despesas',
                        data: [entrySum, exitSum],
                        backgroundColor: ['green', 'red']
                    }]
                }
            });
        }

        const categorySum = {};
        transactions.forEach(transaction => {
            if (!categorySum[transaction.category]) {
                categorySum[transaction.category] = 0;
            }
            categorySum[transaction.category] += transaction.amount;
        });

        if (categoryPieChart) {
            categoryPieChart.data.labels = Object.keys(categorySum);
            categoryPieChart.data.datasets[0].data = Object.values(categorySum);
            categoryPieChart.update();
        } else {
            categoryPieChart = new Chart(categoryPieChartElement, {
                type: 'pie',
                data: {
                    labels: Object.keys(categorySum),
                    datasets: [{
                        data: Object.values(categorySum),
                        backgroundColor: ['blue', 'orange', 'purple', 'yellow', 'pink']
                    }]
                }
            });
        }
    }

    addAccountButton.addEventListener('click', addAccount);
    addTransactionButton.addEventListener('click', addTransaction);
    transactionTypeSelect.addEventListener('change', updateTransactionCategories);

    updateTransactionCategories();
    loadAccounts(); // Carregar contas ao iniciar
    loadTransactions(); // Carregar transações ao iniciar
});


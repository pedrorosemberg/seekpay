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
    const supabaseUrl = 'https://hhuxfoqnksgghhyctksi.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXhmb3Fua3NnZ2hoeWN0a3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwNDc1OTksImV4cCI6MjAzNzYyMzU5OX0.AGCd7t0aFfNEegiU4YTAfSUH2rp4zqpRU-CPKv7fIoI';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    let accounts = [];
    let transactions = [];

    let incomeExpenseChart;
    let categoryPieChart;

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

    async function addAccount(name, balance) {
        const { data, error } = await supabase
            .from('accounts')
            .insert([{ name: name, balance: balance }]);
        
        if (error) {
            console.error('Erro ao adicionar conta:', error.message);
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
            console.error('Erro ao carregar contas:', error.message);
        } else {
            accountsList.innerHTML = ''; // Limpa a lista antes de adicionar novas contas

            data.forEach(account => {
                const accountElement = document.createElement('li');
                accountElement.textContent = `${account.name}: R$${account.balance.toFixed(2)}`;
                accountElement.dataset.accountName = account.name;
                accountsList.appendChild(accountElement);
            });

            // Atualiza a lista de contas no array
            accounts = data;
            updateTotalBalance();
            updateAccountOptions();
        }
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

    async function addTransaction() {
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

        transactions.push({
            type: transactionType,
            category: transactionCategory,
            amount: transactionAmount,
            date: transactionDate,
            account: transactionAccount
        });

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                type: transactionType,
                category: transactionCategory,
                amount: transactionAmount,
                date: transactionDate,
                account: transactionAccount
            }]);

        if (error) {
            console.error('Erro ao adicionar transação:', error.message);
        } else {
            console.log('Transação adicionada:', data);
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

    addAccountButton.addEventListener('click', () => {
        const name = accountNameInput.value;
        const balance = parseFloat(accountBalanceInput.value);
        if (name && !isNaN(balance)) {
            addAccount(name, balance);
        } else {
            alert('Preencha todos os campos corretamente.');
        }
    });

    addTransactionButton.addEventListener('click', addTransaction);
    transactionTypeSelect.addEventListener('change', updateTransactionCategories);

    // Carrega contas ao iniciar
    loadAccounts();

    updateTransactionCategories();
    updateTotalBalance();
    updateCharts();
});

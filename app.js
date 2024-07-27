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
    updateTotalBalance();
    updateCharts();
});


const { data, error } = await supabase
  .from('Seekpay_db')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
          
